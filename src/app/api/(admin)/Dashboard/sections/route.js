import db from "@/lib/db";
export async function GET() {
  try {
    const [result] = await db.query(`
  SELECT 
  name, 
  IFNULL(article_count, 0) AS article_count 
FROM category;
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