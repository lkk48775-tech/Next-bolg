/**
 * AI 上下文类型定义文件。
 *
 * 统一描述读取、压缩、保存用户长期 LLM 上下文时用到的数据结构，
 * 方便 route、loadContext、saveContext 之间保持参数和返回值一致。
 */
export type AiContextMessage = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
};

export type SaveAiContextParams = {
  conversationId?: string;
  userId?: string;
  messages: AiContextMessage[];
  previousContext?: string | null;
};

export type LoadAiContextParams = {
  conversationId?: string;
  userId?: string;
  limit?: number;
};

export type LoadedAiContext = {
  conversationId?: string;
  userId?: string;
  llmContext: string;
  messages: AiContextMessage[];
};
