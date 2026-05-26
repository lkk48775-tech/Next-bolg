import { jsonSchema, tool } from "ai";
import db from "@/lib/db";

type ArticleListRow = {
  title: string;
  summary: string | null;
};

// 文章列表工具：用于让 AI 获取当前博客已发布文章的标题和摘要。
export const listArticlesTool = tool({
  description: "展示当前博客所有已发布文章，只返回文章标题和摘要。",
  inputSchema: jsonSchema<{
    category?: string;
    keyword?: string;
    limit?: number;
  }>({
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "可选分类名称。",
      },
      keyword: {
        type: "string",
        description: "可选搜索关键词，会匹配标题和摘要。",
      },
      limit: {
        type: "number",
        description: "可选返回数量上限，默认 20，最大 50。",
      },
    },
    additionalProperties: false,
  }),
  execute: async ({ category, keyword, limit }) => {
    const conditions = ["a.published = 1"];
    const values: Array<string | number> = [];
    const articleLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);

    if (category) {
      conditions.push("c.name = ?");
      values.push(category);
    }

    if (keyword) {
      conditions.push("(a.title LIKE ? OR a.summary LIKE ?)");
      values.push(`%${keyword}%`, `%${keyword}%`);
    }

    values.push(articleLimit);

    const [rows] = await db.query(
      `
        SELECT
          a.title,
          a.summary
        FROM article a
        LEFT JOIN category c ON a.category_id = c.id
        WHERE ${conditions.join(" AND ")}
        ORDER BY a.updated_at DESC
        LIMIT ?
      `,
      values,
    );

    const articles = (rows as ArticleListRow[]).map((article) => ({
      title: article.title,
      summary: article.summary,
    }));

    return {
      articles,
      count: articles.length,
      message: articles.length ? "文章列表查询成功。" : "没有找到符合条件的文章。",
    };
  },
});
