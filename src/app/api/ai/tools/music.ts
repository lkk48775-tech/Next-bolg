import { jsonSchema, tool } from "ai";

type MusicSearchResponse = Array<{
  id: string;
  name: string;
  artist: string;
  pic_id?: string;
  url_id?: string;
}>;

export const musicRecommendTool = tool({
  description:
    "搜索网易云歌曲。适合用户想听歌、推荐歌曲、emo、放松、深夜等场景。",

  inputSchema: jsonSchema<{
    keyword?: string;
  }>({
    type: "object",
    properties: {
      keyword: {
        type: "string",
        description:
          "歌曲关键词，例如：周杰伦、emo、治愈、深夜。",
      },
    },
    additionalProperties: false,
  }),

  execute: async ({ keyword = "周杰伦" }) => {
    try {
      const response = await fetch(
        `https://music-api.gdstudio.xyz/api.php?types=search&source=netease&name=${encodeURIComponent(
          keyword
        )}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          keyword,
          error: `歌曲接口请求失败，状态码：${response.status}`,
        };
      }

      const data =
        (await response.json()) as MusicSearchResponse;

      if (!Array.isArray(data) || data.length === 0) {
        return {
          keyword,
          error: "没有搜索到歌曲。",
        };
      }

      const song = data[0];

      return {
        keyword,
        song: song.name,
        artist: song.artist,
        id: song.id,
      };
    } catch (error) {
      return {
        keyword,
        error: "歌曲推荐接口调用异常。",
        raw: error instanceof Error ? error.message : String(error),
      };
    }
  },
});