import db from "@/lib/db";



export async function  GET() {
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
export async function POST(req){
  try {
    // 获取前端传递的数据
     const body = await req.json()
     const {name,alias,summary,detail,section,techStacks} = body
     const [category_id]=await db.query(
       "SELECT id FROM category WHERE name = ?",
       [section] 
     )
     console.log(category_id);
    console.log(category_id[0].id);
    //插入数据
    const [result] = await db.query(`
  INSERT INTO article (
    title, 
    summary, 
    description, 
    content, 
    tech_stack, 
    views, 
    like_count, 
    comment_count, 
    category_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)
`, [
        name,
      alias,
      summary,
      detail,
      techStacks,
       0,
      0,
      0,
      category_id[0].id
    ]);
    //  让数据对应的分类文章加1
    await db.query(
      "UPDATE category SET article_count = IFNULL(article_count, 0) + 1   WHERE id = ? ",
    [category_id[0].id]
);
    
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
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get("name");

    if (!name) {
      return Response.json(
        {
          success: false,
          message: "缺少 name"
        },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "DELETE FROM article WHERE title = ?",
      [name]
    );

    console.log(result);

    return Response.json({
      success: true,
      affectedRows: result.affectedRows
    });

  } catch (error) {
    console.error("删除接口报错：", error);

    return Response.json(
      {
        success: false,
        message: error.message
      },
      { status: 500 }
    );
  }
}