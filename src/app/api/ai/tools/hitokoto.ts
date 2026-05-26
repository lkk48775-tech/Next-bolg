import { jsonSchema, tool } from "ai";

type HitokotoResponse = {
  hitokoto: string;
  from?: string;
  from_who?: string | null;
  type?: string;
  creator?: string;
  uuid?: string;
};

// 一言工具：用于让 AI 调用一言接口，获取一句随机短句或语录。
export const hitokotoTool = tool({
  description: "获取一言、短句或一句随机语录。",
  inputSchema: jsonSchema<{
    category?: string;
  }>({
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "可选的一言分类；当前接口默认随机返回，后续可自行扩展分类参数。",
      },
    },
    additionalProperties: false,
  }),
  execute: async ({ category }) => {
    try {
      const response = await fetch("https://v1.hitokoto.cn/?encode=json", {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return {
          category,
          error: `一言接口请求失败，状态码：${response.status}`,
        };
      }

      const data = (await response.json()) as HitokotoResponse;

      return {
        category,
        text: data.hitokoto,
        from: data.from,
        fromWho: data.from_who,
        type: data.type,
        creator: data.creator,
        uuid: data.uuid,
      };
    } catch (error) {
      return {
        category,
        error: "一言接口调用异常。",
        raw: error instanceof Error ? error.message : error,
      };
    }
  },
});
