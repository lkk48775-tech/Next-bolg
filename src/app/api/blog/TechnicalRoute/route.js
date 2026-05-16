/**
 * 归档页 API
 * 
 * 归档页需要按时间线展示所有文章（按年份分组）。
 * 这个接口返回所有已发布文章的基本信息 + 分类名 + 发布时间。
 * 前端拿到数据后按 created_at 的年份分组，渲染成时间线。
 * 
 * 返回的字段说明：
 * - title: 文章标题（如 "Flex布局"）
 * - description: 文章描述/别名（如 "弹性布局的核心"），显示在时间线上
 * - summary: 文章摘要，用于打字机效果
 * - slug: 文章标识符，用于拼接 URL（如 "css-flex"）
 * - category_name: 分类名（如 "CSS"），用于拼接 URL 路径
 * - created_at: 发布时间，用于按年份分组和显示日期
 * 
 * 请求方式：GET /api/blog/TechnicalRoute
 * 返回格式：{ code: 200, data: [{ id, title, description, summary, slug, category_name, created_at }, ...] }
 */
import db from "@/lib/db";

export async function GET() {
  try {
    // 查所有已发布文章，JOIN category 拿分类名，按发布时间倒序
    // published = 1 表示只查已发布的文章（草稿不显示）
    const [rows] = await db.query(`
      SELECT 
        a.id, 
        a.title, 
        a.description, 
        a.summary,
        a.slug, 
        a.created_at,
        c.name AS category_name
      FROM article a
      LEFT JOIN category c ON a.category_id = c.id
      WHERE a.published = 1
      ORDER BY a.created_at DESC
    `);

    return Response.json({
      code: 200,
      data: rows,
    });
  } catch (err) {
    return Response.json({
      code: 500,
      msg: err.message,
    });
  }
}
