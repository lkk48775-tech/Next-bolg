import type { ExtractUserProfileParams, UserProfileSummary } from "./types";

// 用户信息提取：用于从对话内容中整理用户昵称、兴趣、偏好和重要事实等信息。
export async function extractUserProfile(
  params: ExtractUserProfileParams,
): Promise<UserProfileSummary> {
  // TODO: 在这里补充提取用户主要信息的逻辑。
  // 例如：从 messages 中提取用户昵称、兴趣、偏好、重要事实等。
  return {
    updatedAt: new Date().toISOString(),
  };
}
