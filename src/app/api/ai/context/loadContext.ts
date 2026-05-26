/**
 * AI 上下文读取文件。
 *
 * 根据登录用户 id 从 user_llm_context 表读取已经压缩过的长期上下文，
 * 供 /api/ai 在调用 LLM 前作为额外 system message 注入。
 */
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import type { LoadedAiContext, LoadAiContextParams } from "./types";

type UserLlmContextRow = RowDataPacket & {
  llm_context: string | null;
};

export async function loadAiContext(
  params: LoadAiContextParams,
): Promise<LoadedAiContext> {
  if (!params.userId) {
    return {
      conversationId: params.conversationId,
      userId: params.userId,
      llmContext: "",
      messages: [],
    };
  }

  const [rows] = await pool.query<UserLlmContextRow[]>(
    "SELECT llm_context FROM user_llm_context WHERE user_id = ? LIMIT 1",
    [params.userId],
  );

  return {
    conversationId: params.conversationId,
    userId: params.userId,
    llmContext: rows[0]?.llm_context?.trim() || "",
    messages: [],
  };
}
