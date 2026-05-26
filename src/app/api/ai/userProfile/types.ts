// 用户信息类型：定义从对话中提取用户主要信息时需要使用的数据结构。
export type ExtractUserProfileParams = {
  conversationId?: string;
  userId?: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
};

export type UserProfileSummary = {
  nickname?: string;
  interests?: string[];
  preferences?: string[];
  importantFacts?: string[];
  updatedAt?: string;
};
