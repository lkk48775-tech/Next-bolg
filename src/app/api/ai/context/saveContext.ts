/**
 * AI 上下文保存文件。
 *
 * 在一次对话结束后，将旧的长期上下文和本轮 user/assistant 消息交给 LLM 重新压缩，
 * 然后 upsert 到 user_llm_context 表，作为该用户后续对话的长期记忆。
 */
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import pool from "@/lib/db";
import type { AiContextMessage, SaveAiContextParams } from "./types";

const MAX_CONTEXT_CHARS = 4000;
const MAX_RAW_EXCHANGE_CHARS = 6000;

const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
  name: "deepseek",
});

function formatMessage(message: AiContextMessage) {
  return `${message.role}: ${message.content}`.trim();
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}

function buildFallbackContext(previousContext: string, messages: AiContextMessage[]) {
  const nextContext = [previousContext, messages.map(formatMessage).join("\n")]
    .filter(Boolean)
    .join("\n\n");

  return truncateText(nextContext, MAX_CONTEXT_CHARS);
}

async function compressContext(
  previousContext: string,
  messages: AiContextMessage[],
) {
  const rawExchange = truncateText(messages.map(formatMessage).join("\n"), MAX_RAW_EXCHANGE_CHARS);

  if (!rawExchange) {
    return truncateText(previousContext, MAX_CONTEXT_CHARS);
  }

  try {
    const result = await generateText({
      model: deepseek.chat("deepseek-chat"),
      system:
        "You maintain a compact long-term memory for a blog AI assistant. Keep only durable facts, user preferences, goals, constraints, names, and unresolved tasks. Remove greetings, filler, one-off tool results, and transient wording. Write concise Simplified Chinese unless the facts are code or proper nouns. Do not invent anything.",
      prompt: `Existing memory:
${previousContext || "(empty)"}

Latest conversation:
${rawExchange}

Update the memory into no more than ${MAX_CONTEXT_CHARS} Chinese characters. Return only the memory text.`,
    });

    return truncateText(result.text.trim(), MAX_CONTEXT_CHARS);
  } catch (error) {
    console.error("Failed to compress AI context:", error);
    return buildFallbackContext(previousContext, messages);
  }
}

export async function saveAiContext(params: SaveAiContextParams) {
  if (!params.userId) {
    return {
      ok: false,
      conversationId: params.conversationId,
      userId: params.userId,
      savedCount: 0,
    };
  }

  const nextContext = await compressContext(
    params.previousContext?.trim() || "",
    params.messages,
  );

  await pool.query(
    `INSERT INTO user_llm_context (user_id, llm_context)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE
       llm_context = VALUES(llm_context),
       updated_at = CURRENT_TIMESTAMP`,
    [params.userId, nextContext],
  );

  return {
    ok: true,
    conversationId: params.conversationId,
    userId: params.userId,
    savedCount: params.messages.length,
  };
}
