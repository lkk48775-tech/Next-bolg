import db from "@/lib/db";

export async function GET() {
  try {
    const [result] = await db.query(`
      SELECT
        a.id,
        a.title,
        c.name AS category
      FROM article a
      LEFT JOIN category c
        ON a.category_id = c.id
    `);

    return Response.json({
      code: 200,
      data: result
    });
  } catch (err) {
    return Response.json({
      code: 500,
      msg: err.message,
    });
  }
}
