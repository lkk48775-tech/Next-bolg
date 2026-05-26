import { tool } from "ai";
import { z } from "zod";

// 工具的入参校验规则。
// 这份 schema 同时有两个作用：
// 1. 告诉大模型：调用天气工具时需要提供哪些参数；
// 2. 在工具真正执行前，让 AI SDK 校验模型生成的参数是否符合要求。
const weatherInputSchema = z.object({
  // describe 会作为参数说明传给模型，帮助模型从“北京天气”里抽取出 city = "北京"。
  city: z.string().describe("城市名称，例如 北京、上海、深圳"),
});

// 从 Zod schema 自动推导 TypeScript 类型，避免 schema 和 execute 参数类型写两遍后不一致。
type WeatherInput = z.infer<typeof weatherInputSchema>;

// 高德天气 API 的响应结构。
// 这里只声明当前代码会用到的字段，不必把高德完整响应都写出来。
// 注意：高德接口里的很多数值字段是字符串，比如 temperature、humidity。
type AmapWeatherResponse = {
  // "1" 表示成功，"0" 表示失败。
  status: string;
  // 失败时通常会带上错误说明，例如 USERKEY_PLAT_NOMATCH。
  info?: string;
  // 实时天气数据列表。查询城市天气时通常只有一条。
  lives?: Array<{
    city: string;
    temperature: string;
    weather: string;
    humidity: string;
    winddirection: string;
    windpower: string;
    reporttime: string;
  }>;
};

// 工具最终返回给模型的数据结构。
// 成功时返回天气信息；失败时返回 error。
// 这个返回值不会直接显示给用户，而是先交给模型，由模型继续生成自然语言回答。
type WeatherResult =
  | {
    // 城市名称，例如“北京市”。
    city: string;
    // 实时温度。高德返回的是字符串，这里保持原样，避免不必要的类型转换。
    temperature: string;
    // 天气现象，例如“晴”“多云”“小雨”。
    weather: string;
    // 湿度百分比，来自高德的 humidity 字段。
    humidity: string;
    // 拼接后的风向和风力，例如“东北风 2级”。
    wind: string;
    // 高德数据发布时间。
    reportTime: string;
  }
  | {
    // 工具执行失败时的简短错误信息，模型会根据它向用户解释。
    error: string;
    // 原始错误或原始接口响应，方便开发调试；不要在前端直接暴露敏感信息。
    raw?: unknown;
  };

export const weatherTool = tool<WeatherInput, WeatherResult>({
  // 这段描述会发给模型，帮助模型判断什么时候该调用这个工具。
  // 描述越具体，模型越容易在用户问“某地天气”时正确选择该工具。
  description: "使用高德API查询中国城市天气",

  // AI SDK 6 使用 inputSchema；parameters 是旧版本写法，会导致 execute 类型匹配失败。
  inputSchema: weatherInputSchema,

  // 当模型判断需要查询天气时，AI SDK 会自动执行这个函数。
  // execute 的参数来自模型生成，并且已经通过上面的 inputSchema 校验。
  execute: async ({ city }: WeatherInput): Promise<WeatherResult> => {
    try {
      // 高德 Web 服务 API Key 放在服务端环境变量里，不能写到前端代码中。
      // 这里读取的是 .env.local 里的 AMAP_KEY；修改后需要重启 dev server 才会生效。
      const key = process.env.AMAP_KEY;

      if (!key) {
        return {
          error: "缺少 AMAP_KEY 环境变量",
        };
      }

      // extensions=base 表示查询实时天气；如果要查预报，可以改成 extensions=all。
      // encodeURIComponent 用来处理中文城市名，避免 URL 中出现未编码字符。
      const url =
        `https://restapi.amap.com/v3/weather/weatherInfo` +
        `?city=${encodeURIComponent(city)}` +
        `&key=${key}` +
        `&extensions=base`;

      // 这个 fetch 运行在服务端 route/tool 中，不会把 AMAP_KEY 暴露给浏览器。
      const res = await fetch(url);
      const data = (await res.json()) as AmapWeatherResponse;

      // 高德 API 的 status 为 "1" 表示请求成功；其他值通常代表 key、城市名或配额问题。
      // 例如 USERKEY_PLAT_NOMATCH 通常表示 Key 类型不是“Web服务”。
      if (data.status !== "1") {
        return {
          error: "高德API调用失败",
          raw: data,
        };
      }

      // lives 是实时天气数组。通常查询单个城市时取第一个结果即可。
      // 如果用户输入的城市不存在，或者高德没有返回实时天气，这里可能是 undefined。
      const live = data.lives?.[0];

      if (!live) {
        return {
          error: "未查询到该城市天气",
          raw: data,
        };
      }

      // 统一整理成模型容易理解的结构，再交给模型生成自然语言回答。
      // 这样模型收到的是干净字段，而不是完整的高德原始响应。
      return {
        city: live.city,
        temperature: live.temperature,
        weather: live.weather,
        humidity: live.humidity,
        wind: live.winddirection + "风 " + live.windpower + "级",
        reportTime: live.reporttime,
      };
    } catch (error) {
      // 网络错误、JSON 解析错误等异常会走到这里。
      // 返回结构化错误，而不是直接 throw，可以让模型给用户一个友好的失败提示。
      return {
        error: "天气查询异常",
        raw: error,
      };
    }
  },
});
