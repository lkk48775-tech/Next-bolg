import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { getCurrentDbUser } from "@/lib/sessionUser";
import { loadAiContext, saveAiContext } from "./context";
import { getArticle, getArticleStats, hitokoto, listArticles, poi, weather, moyuText, musicRecommen, searchArticleContent } from "./tools";

const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
  name: "deepseek",
});

type AiUiMessagePart = {
  type?: string;
  text?: string;
  content?: string;
};

type AiUiMessage = {
  role?: string;
  content?: string;
  parts?: AiUiMessagePart[];
};

function getMessageText(message: AiUiMessage) {
  // useChat 的消息可能是 content 字符串，也可能拆在 parts 里。
  if (typeof message?.content === "string") {
    return message.content;
  }

  if (Array.isArray(message?.parts)) {
    return message.parts
      .map((part) => {
        if (part?.type === "text") return part.text;
        if (typeof part?.text === "string") return part.text;
        if (typeof part?.content === "string") return part.content;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function getLatestUserMessage(messages: AiUiMessage[]) {
  // 只提取本轮最新用户输入，避免把整段前端历史重复压缩进长期记忆。
  return [...messages].reverse().find((message) => message?.role === "user");
}

export async function POST(req: Request) {
  const { messages = [] } = await req.json();
  // 未登录用户不读写长期上下文；登录用户使用数据库里的压缩记忆。
  const currentUser = await getCurrentDbUser();
  const userId = currentUser?.id ? String(currentUser.id) : undefined;
  let storedContext = null;

  if (userId) {
    try {
      storedContext = await loadAiContext({ userId });
    } catch (error) {
      console.error("Failed to load AI context:", error);
    }
  }
  const modelMessages = await convertToModelMessages(messages);
  const toolInstructionMessages = [
    {
      role: "system" as const,
      content:
        "当用户询问博客正文中是否提到某个关键词、短语、主题或概念，或要求搜索文章正文内容时，优先调用 searchArticleContent 工具。当用户询问博客文章总数、分类分布、各分类文章数量时，优先调用 getArticleStats 工具。当用户要求列出、展示、查看文章列表时，调用 listArticles 工具。",
    },
  ];
  // 把长期上下文作为额外 system message 注入，不改变用户本轮消息本身。
  const messagesWithStoredContext = storedContext?.llmContext
    ? [
        ...toolInstructionMessages,
        {
          role: "system" as const,
          content: `以下是该登录用户过往对话提取压缩后的长期上下文。请在相关时自然参考，不要主动复述，也不要把它当作用户本轮明确要求：\n${storedContext.llmContext}`,
        },
        ...modelMessages,
      ]
    : [...toolInstructionMessages, ...modelMessages];
  const latestUserMessage = getLatestUserMessage(messages);

  const result = streamText({
    model: deepseek.chat("deepseek-chat"),
    system: `你是一个博客 AI 助手，可以进行日常对话回复。

回答风格：
- 短回复、闲聊、简单确认时，直接自然回答，不要强行使用 Markdown。
- 只有当内容较多、需要分点、步骤、对比、表格、代码或文章列表时，才使用 Markdown。
- 用户问你问过哪些问题可以从上下文中找到最近的进行回答
- 多点内容可以用列表，有步骤时可以用编号列表。
- 需要对比、汇总字段、展示优缺点或参数时，可以使用 Markdown 表格。
- 有代码时使用 Markdown 代码块。
- 标题只在长回答、结构化回答，或“一言/语录/热评”回复中使用。
- 不要输出冗长的大段文字。

工具调用规则：
- 当用户需要一言、摸鱼日报，推荐音乐，语录、网易云热评、查看某篇文章、展示所有文章、获取文章总数和分类分布，列出文章列表，根据查看天气或查询地点时，优先调用对应工具。
-- 当用户提到摸鱼、上班、打工人、周一综合征、累了、不想工作等内容时，可以优先调用 moyuText 工具。
-  回复时要有一点幽默感和打工人氛围。
- 如果用户表达“来一句”“一言”“伤感的话”“治愈的话”“网易云热评”“语录”等意图，必须优先调用 hitokoto 工具。
- 如果一个问题需要多个工具，先分析需要哪些信息，再按依赖顺序调用工具。
- 每次工具调用完成后，必须基于工具结果继续判断是否还需要调用下一个工具。
- 不要在工具还没调用完成时提前给最终答案。
- 所有必要工具调用完成后，再把结果整理成统一、清晰的最终回复。

功能列表规则：
- 当用户询问“你有什么功能”“你会什么”“支持什么”“功能列表”“help”“菜单”等类似问题时，需要完整列出当前支持的所有功能。
- 不要把多个功能合并成一句话概括。
- 每个功能都需要单独列出。
- 使用 Markdown 列表或分组展示。
- 不要遗漏任何功能。
- 功能介绍保持简洁，但要清晰。

一言回复格式：
- 当你调用 hitokoto 工具并拿到结果后，最终回复必须使用下面格式。
- 第一行必须是一个根据一言内容自动生成的标题。
- 标题格式为：## 表情 标题 表情
- 表情不能固定，要根据一言氛围变化。
- 标题要有氛围感，不要写成“一言推荐”这种普通标题。
- 中间用引用块展示一言内容。
- 如果工具结果里有来源，必须展示来源。
- 最后必须加一个个人感悟总结。
- 语气温柔、有共鸣、有一点个人情绪。
- 不要解释格式规则。
- 不要输出 JSON。

一言回复示例：

## 🌙 深夜里的温柔回声 🎧

> 后来我终于知道，它并不是我的花。——《小王子》

有些人和事只是短暂路过，却会在心里停很久。真正的释怀，不是忘记，而是终于愿意承认：它曾经很美，但不一定属于我。`,
    messages: messagesWithStoredContext,
    tools: {
      hitokoto,
      getArticle,
      getArticleStats,
      listArticles,
      searchArticleContent,
      weather,
      poi,   
      moyuText,
      musicRecommen
    },
    async onFinish({ text }) {
      if (!userId || !latestUserMessage) return;

      try {
        // 流式回复完成后再压缩保存，避免影响用户看到首 token 的速度。
        await saveAiContext({
          userId,
          previousContext: storedContext?.llmContext || "",
          messages: [
            {
              role: "user",
              content: getMessageText(latestUserMessage),
              createdAt: new Date().toISOString(),
            },
            {
              role: "assistant",
              content: text,
              createdAt: new Date().toISOString(),
            },
          ],
        });
      } catch (error) {
        console.error("Failed to save AI context:", error);
      }
    },
    // 允许模型进行多轮工具调用：工具结果会自动加入下一步上下文，
    // 模型可以继续决定是否调用下一个工具，直到不再需要工具或达到上限。
    stopWhen: stepCountIs(8),
  });

  return result.toUIMessageStreamResponse({
    onError(error) {
      console.error("AI stream error:", error);
      return error instanceof Error ? error.message : "AI 接口请求失败";
    },
  });
}
