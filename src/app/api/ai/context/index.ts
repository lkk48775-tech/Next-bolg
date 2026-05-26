/**
 * AI 上下文模块统一出口。
 *
 * 集中导出上下文类型、读取方法和保存方法，让 route.ts 只需要从该目录入口引用。
 */
export type {
  AiContextMessage,
  LoadedAiContext,
  LoadAiContextParams,
  SaveAiContextParams,
} from "./types";

export { loadAiContext } from "./loadContext";
export { saveAiContext } from "./saveContext";
