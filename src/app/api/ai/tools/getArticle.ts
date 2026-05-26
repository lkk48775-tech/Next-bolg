import { jsonSchema, tool } from "ai";
import db from "@/lib/db";

type ArticleRow = {
  id: number;
  title: string;
  summary: string | null;
  description: string | null;
  content: string | null;
  tech_stack: string | null;
  cover: string | null;
  slug: string | null;
  views: number | null;
  like_count: number | null;
  comment_count: number | null;
  category_id: number | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

const normalizeDate = (value: Date | string | null) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
};

const normalizeArticle = (article: ArticleRow) => ({
  id: article.id,
  title: article.title,
  summary: article.summary,
  description: article.description,
  content: article.content,
  techStack: article.tech_stack,
  cover: article.cover,
  slug: article.slug,
  views: article.views,
  likeCount: article.like_count,
  commentCount: article.comment_count,
  categoryId: article.category_id,
  createdAt: normalizeDate(article.created_at),
  updatedAt: normalizeDate(article.updated_at),
});

// 文章查询工具：用于让 AI 根据 id、slug 或关键词查询已发布文章，可返回多篇匹配结果。
export const getArticleTool = tool({
  description:
    "根据文章 id、slug 或关键词查询已发布博客文章；关键词会模糊匹配 title、summary 和 content，可返回多篇。",
  inputSchema: jsonSchema<{
    slug?: string;
    id?: string;
    title?: string;
    keyword?: string;
    limit?: number;
  }>({
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "文章 slug，例如 technical/nextjs-intro。",
      },
      id: {
        type: "string",
        description: "文章 ID。",
      },
      title: {
        type: "string",
        description: "文章标题或搜索关键词，会匹配 title、summary、content。",
      },
      keyword: {
        type: "string",
        description: "搜索关键词，会匹配 title、summary、content。",
      },
      limit: {
        type: "number",
        description: "可选返回数量上限，默认 5，最大 20。",
      },
    },
    additionalProperties: false,
  }),
  execute: async ({ slug, id, title, keyword, limit }) => {
    const articleId = id ? Number(id) : null;
    const searchText = keyword || title;
    const articleLimit = Math.min(Math.max(Number(limit) || 5, 1), 20);

    if (id && !Number.isInteger(articleId)) {
      return {
        articles: [],
        count: 0,
        message: "文章 ID 必须是数字。",
      };
    }

    if (!articleId && !slug && !searchText) {
      return {
        articles: [],
        count: 0,
        message: "请提供文章 id、slug、title 或 keyword 中的任意一个。",
      };
    }

    const conditions = ["published = 1"];
    const values: Array<number | string> = [];

    if (articleId) {
      conditions.push("id = ?");
      values.push(articleId);
    } else if (slug) {
      conditions.push("slug = ?");
      values.push(slug);
    } else if (searchText) {
      conditions.push("(title LIKE ? OR summary LIKE ? OR content LIKE ?)");
      values.push(`%${searchText}%`, `%${searchText}%`, `%${searchText}%`);
    }

    values.push(articleLimit);

    const [rows] = await db.query(
      `
        SELECT
          id,
          title,
          summary,
          description,
          content,
          tech_stack,
          cover,
          slug,
          views,
          like_count,
          comment_count,
          category_id,
          created_at,
          updated_at
        FROM article
        WHERE ${conditions.join(" AND ")}
        ORDER BY updated_at DESC
        LIMIT ?
      `,
      values,
    );

    const articles = (rows as ArticleRow[]).map(normalizeArticle);

    return {
      articles,
      count: articles.length,
      message: articles.length
        ? `查到了 ${articles.length} 篇相关文章。`
        : "没有找到对应的已发布文章。",
    };
  },
});
