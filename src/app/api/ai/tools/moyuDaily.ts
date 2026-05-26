import { jsonSchema, tool } from "ai";

type MoyuResponse = {
  code?: number;
  data?: string;
};

export const moyuTextTool = tool({
  description:
    "获取一句摸鱼文案、打工人语录。适合用户提到上班、摸鱼、打工人、周一综合征、累了、不想工作等场景。",

  inputSchema: jsonSchema<{
    day?: string;
  }>({
    type: "object",
    properties: {
      day: {
        type: "string",
        description: "几点发送的摸鱼提醒，例如 10。",
      },
    },
    additionalProperties: false,
  }),

  execute: async ({ day = "10" }) => {
    try {
      const response = await fetch(
        `https://moyu.awsl.icu/api/moyu_json?day=${day}`,
        {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          day,
          error: `摸鱼文案接口请求失败，状态码：${response.status}`,
        };
      }

      const data = (await response.json()) as MoyuResponse;

      return {
        day,
        title: "摸鱼语录",
        content: data.data || "今天也要努力摸鱼。",
      };
    } catch (error) {
      return {
        day,
        error: "摸鱼文案接口调用异常。",
        raw: error instanceof Error ? error.message : String(error),
      };
    }
  },
});