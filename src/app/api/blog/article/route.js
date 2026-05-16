/**
 * 文章详情 API
 * 
 * 用户点击某篇文章进入详情页时，前端会请求这个接口获取文章的完整数据。
 * 
 * 工作流程：
 * 1. 前端传一个 slug 参数（文章的唯一标识，比如 "css-flex"）
 * 2. 后端根据 slug 从 article 表查出这篇文章
 * 3. 同时 JOIN category 表拿到分类名（比如 "CSS"）
 * 4. 返回文章的所有字段，包括 content（MDX 格式的正文内容）
 * 
 * 前端拿到 content 后会：
 * - 清理掉 import/export 语句
 * - 把 <CodeWindow> 标签转成标准 Markdown 代码块
 * - 用 next-mdx-remote 的 serialize 编译成可渲染格式
 * - 用 <MDXRemote> 渲染到页面上
 * 
 * 请求方式：GET /api/blog/article?slug=css-flex
 * 返回格式：{ code: 200, data: { id, title, summary, description, content, slug, tech_stack, category_name, created_at } }
 */
import db from "@/lib/db";
import { getCurrentDbUser } from "@/lib/sessionUser";

export async function GET(req) {
  try {
    // 从 URL 的查询参数中取出 slug
    // 比如请求 /api/blog/article?slug=css-flex，这里 slug = "css-flex"
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    // 没传 slug 就返回 400 错误
    if (!slug) {
      return Response.json({ code: 400, msg: "缺少 slug 参数" });
    }

    const currentDbUser = await getCurrentDbUser().catch(() => null);

    // SQL 查询：根据 slug 找文章，LEFT JOIN category 表拿分类名
    // LEFT JOIN 的意思是：即使文章没有关联分类，也会返回文章数据（分类名为 null）
    // LIMIT 1 表示只取一条（slug 应该是唯一的）
    const [rows] = await db.query(`
      SELECT 
        a.id, a.title, a.summary, a.description, a.content, a.slug, a.tech_stack, a.like_count, a.created_at,
        c.name AS category_name,
        CASE WHEN al.id IS NULL THEN 0 ELSE 1 END AS liked
      FROM article a
      LEFT JOIN category c ON a.category_id = c.id
      LEFT JOIN article_like al ON al.article_id = a.id AND al.user_id = ?
      WHERE a.slug = ?
      LIMIT 1
    `, [currentDbUser?.id || 0, slug]);
    // 注意：用 ? 占位符防止 SQL 注入，slug 的值会被安全地转义

    // 没找到文章
    if (rows.length === 0) {
      return Response.json({ code: 404, msg: "文章不存在" });
    }

    // 返回找到的文章数据（rows[0] 是第一条也是唯一一条）
    return Response.json({
      code: 200,
      data: {
        ...rows[0],
        likeCount: rows[0].like_count || 0,
        liked: Boolean(rows[0].liked),
      },
    });
  } catch (err) {
    return Response.json({ code: 500, msg: err.message });
  }
}
