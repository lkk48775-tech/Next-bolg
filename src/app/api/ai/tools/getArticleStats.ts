import { jsonSchema, tool } from "ai";
import db from "@/lib/db";

type TotalRow = {
  total: number;
};

type CategoryStatsRow = {
  category_id: number | null;
  category_name: string | null;
  article_count: number;
};

// 博客文章统计工具：只返回已发布文章总数和分类分布，不返回文章列表。
export const getArticleStatsTool = tool({
  description:
    "获取当前博客已发布文章总数和分类分布。适合回答有多少篇文章、各分类分别有多少篇、博客文章概览统计等问题。",
  inputSchema: jsonSchema<Record<string, never>>({
    type: "object",
    properties: {},
    additionalProperties: false,
  }),
  execute: async () => {
    const [totalRows] = await db.query(
      "SELECT COUNT(*) AS total FROM article WHERE published = 1",
    );

    const [categoryRows] = await db.query(
      `
        SELECT
          c.id AS category_id,
          c.name AS category_name,
          COUNT(a.id) AS article_count
        FROM category c
        LEFT JOIN article a
          ON a.category_id = c.id
          AND a.published = 1
        GROUP BY c.id, c.name
        HAVING article_count > 0
        ORDER BY article_count DESC, c.name ASC
      `,
    );

    const total = Number((totalRows as TotalRow[])[0]?.total || 0);
    const categories = (categoryRows as CategoryStatsRow[]).map((category) => ({
      categoryId: category.category_id,
      categoryName: category.category_name || "未分类",
      articleCount: Number(category.article_count || 0),
    }));

    return {
      total,
      categories,
      categoryCount: categories.length,
      message: total
        ? `当前博客共有 ${total} 篇已发布文章，分布在 ${categories.length} 个分类中。`
        : "当前博客暂无已发布文章。",
    };
  },
});
