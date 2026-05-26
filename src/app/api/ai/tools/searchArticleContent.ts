import { jsonSchema, tool } from "ai";
import db from "@/lib/db";

type ArticleContentSearchRow = {
  id: number;
  title: string;
  summary: string | null;
  slug: string | null;
  category_name: string | null;
  snippet: string | null;
  updated_at: Date | string | null;
};

const normalizeDate = (value: Date | string | null) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
};

const normalizeSnippet = (value: string | null) =>
  (value || "")
    .replace(/[#>*_`~\[\]()\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// 搜索博客正文工具：用于判断文章正文中是否提到某个关键词或主题，并返回命中文章和附近片段。
export const searchArticleContentTool = tool({
  description:
    "搜索已发布博客文章正文 content 中是否提到某个关键词、短语或主题；返回命中文章标题、slug、分类和正文附近片段，不返回完整正文。",
  inputSchema: jsonSchema<{
    query: string;
    limit?: number;
  }>({
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "要在博客正文中搜索的关键词、短语或主题，例如 React 性能优化、虚拟列表、防抖。",
      },
      limit: {
        type: "number",
        description: "可选返回数量上限，默认 8，最大 20。",
      },
    },
    required: ["query"],
    additionalProperties: false,
  }),
  execute: async ({ query, limit }) => {
    const keyword = query?.trim();
    const searchLimit = Math.min(Math.max(Number(limit) || 8, 1), 20);

    if (!keyword) {
      return {
        mentioned: false,
        matches: [],
        count: 0,
        message: "请提供要搜索的关键词或主题。",
      };
    }

    const likeKeyword = `%${keyword}%`;

    const [rows] = await db.query(
      `
        SELECT
          a.id,
          a.title,
          a.summary,
          a.slug,
          a.updated_at,
          c.name AS category_name,
          SUBSTRING(
            a.content,
            GREATEST(LOCATE(?, a.content) - 80, 1),
            220
          ) AS snippet
        FROM article a
        LEFT JOIN category c ON a.category_id = c.id
        WHERE a.published = 1
          AND a.content IS NOT NULL
          AND a.content LIKE ?
        ORDER BY a.updated_at DESC
        LIMIT ?
      `,
      [keyword, likeKeyword, searchLimit],
    );

    const matches = (rows as ArticleContentSearchRow[]).map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      slug: article.slug,
      categoryName: article.category_name,
      snippet: normalizeSnippet(article.snippet),
      updatedAt: normalizeDate(article.updated_at),
    }));

    return {
      mentioned: matches.length > 0,
      matches,
      count: matches.length,
      message: matches.length
        ? `博客正文中提到了“${keyword}”，共找到 ${matches.length} 篇相关文章。`
        : `博客正文中暂未找到“${keyword}”的直接提及。`,
    };
  },
});
