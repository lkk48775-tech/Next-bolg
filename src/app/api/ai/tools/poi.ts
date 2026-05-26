import { tool } from "ai";
import { z } from "zod";

// POI 工具的入参规则。
// POI 是 Point of Interest 的缩写，可以理解为“地点/兴趣点”。
// 这份 schema 会告诉模型：调用这个工具时必须同时给出 keyword 和 city。
const poiInputSchema = z.object({
  // 用户想查的地点类型或名称，例如“火锅”“咖啡”“酒店”“故宫”。
  keyword: z.string().describe("关键词，例如：火锅、咖啡、酒店、景点"),
  // 限定搜索城市，避免同名地点在全国范围内混在一起。
  city: z.string().describe("城市，例如 北京、上海"),
  // 可选分类提示，例如餐厅、酒店、景点。没有 keyword 时可作为兜底查询词。
  type: z.string().optional(),
});

// 从 schema 推导 execute 的入参类型，保证类型和校验规则保持一致。
type PoiInput = z.infer<typeof poiInputSchema>;

// 高德 POI 文本搜索接口的响应结构。
// 这里只声明当前会用到的字段，不需要完整覆盖高德返回的所有字段。
type AmapPoiResponse = {
  // "1" 表示成功，"0" 表示失败。
  status: string;
  // 失败时的说明，例如 key 类型错误、配额不足、参数错误等。
  info?: string;
  // 搜索到的地点列表。
  pois?: Array<{
    // 地点名称。
    name: string;
    // 高德有时会把空地址返回成数组，所以这里兼容 string | unknown[]。
    address: string | unknown[];
    // 经纬度字符串，格式通常是 "longitude,latitude"。
    location: string;
  }>;
};

// 工具返回给模型的数据结构。
// 成功时返回整理后的地点列表；失败时返回 error 和可选 raw，方便排查。
type PoiResult =
  | {
    // 查询所在城市。
    city: string;
    // 查询关键词。
    keyword: string;
    // 整理后的 POI 结果，只保留模型回答用户时最常用的信息。
    results: Array<{
      name: string;
      address: string;
      location: string;
    }>;
  }
  | {
    // 简短错误信息，模型会据此生成用户能看懂的回复。
    error: string;
    // 原始错误或原始接口响应，主要用于开发调试。
    raw?: unknown;
  };

export const poiTool = tool<PoiInput, PoiResult>({
  // 这段描述会发给模型，帮助模型判断什么时候应该调用 POI 工具。
  description: "查询附近地点（餐厅、酒店、景点等）",

  // AI SDK 6 使用 inputSchema；parameters 是旧版本写法。
  inputSchema: poiInputSchema,

  // 模型需要查询地点时，AI SDK 会自动执行这个函数。
  // 参数来自模型生成，并且已经通过 poiInputSchema 校验。
  execute: async ({ keyword, city, type }: PoiInput): Promise<PoiResult> => {
    try {
      // 高德 Web 服务 Key 只能放在服务端环境变量中，不能暴露到浏览器。
      const key = process.env.AMAP_KEY;

      if (!key) {
        return {
          error: "缺少 AMAP_KEY 环境变量",
        };
      }

      // 高德 POI 文本搜索接口。
      // offset=5 表示最多返回 5 条，page=1 表示第一页结果。
      const url =
        `https://restapi.amap.com/v3/place/text` +
        `?keywords=${encodeURIComponent(keyword || type || "")}` +
        `&city=${encodeURIComponent(city)}` +
        `&key=${key}` +
        `&offset=5` +
        `&page=1`;

      // fetch 在服务端执行，所以 AMAP_KEY 不会出现在前端网络请求里。
      const res = await fetch(url);
      const data = (await res.json()) as AmapPoiResponse;

      // 高德 status 不为 "1" 时说明查询失败，保留 raw 便于查看具体 info/infocode。
      if (data.status !== "1") {
        return {
          error: "POI查询失败",
          raw: data,
        };
      }

      // 只把名称、地址和坐标整理出来交给模型。
      // 如果 address 是数组，通常代表地址为空，这里统一转成空字符串。
      const pois = data.pois?.map((item) => ({
        name: item.name,
        address: Array.isArray(item.address) ? "" : item.address,
        location: item.location,
      })) ?? [];

      return {
        city,
        keyword: keyword || type || "",
        results: pois,
      };
    } catch (error) {
      // 网络错误、JSON 解析错误等异常会走到这里。
      // 返回结构化错误，避免整个聊天请求直接崩掉。
      return {
        error: "POI接口异常",
        raw: error,
      };
    }
  },
});
