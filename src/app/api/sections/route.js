/**
 * 文章 API 路由
 * 
 * Next.js App Router 的 API Route，处理文章相关的 HTTP 请求。
 * 路径：/api/articles
 * 
 * 支持的方法：
 * - GET: 获取所有文章列表（按 id 倒序）
 * - POST: 新增文章分类到数据库
 */
import db from "@/lib/db";

/**
 * GET /api/articles
 * 获取所有文章，按 id 倒序排列
 * 
 * 返回格式：{ code: 200, data: [...] }
 */
// 获取所有分类名称（只拿 name）
export async function GET() {
  try {
    // 只查询 name 字段！！！
    const [rows] = await db.query("SELECT name FROM category");

    // 返回给前端
    return Response.json({
      code: 200,
      data: rows,
    });
  } catch (error) {
    return Response.json(
      { code: 500, msg: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, article_count } = body;

    const [result] = await db.query(
      `INSERT INTO category (name, article_count)
       VALUES (?, ?)`,
      [name, article_count]
    );

    return Response.json({
      success: true,
      data: result
    });

  } catch (err) {
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    await db.query(
      "DELETE FROM category WHERE name = ?",
      [name]
    );

    return Response.json({
      success: true,
      message: "删除成功"
    });

  } catch (err) {
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}