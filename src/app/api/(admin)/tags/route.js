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
     const {name,alias,summary,detail,section,techStacks,slug} = body
     const [category_id]=await db.query(
       "SELECT id FROM category WHERE name = ?",
       [section] 
     )
     console.log(category_id);
    console.log(category_id[0].id);
    //插入数据
//     const [result] = await db.query(`
//   INSERT INTO article (
//     title, 
//     summary, 
//     description, 
//     content, 
//     tech_stack, 
//     views, 
//     like_count, 
//     comment_count, 
//     category_id
//   ) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)
// `, [
//         name,
//       alias,
//       summary,
//       detail,
//       JSON.stringify(techStacks),
//        0,
//       0,
//       0,
//       category_id[0].id
//     ]);
    const [result] = await db.query(`
  INSERT INTO article (
    title, 
    summary, 
    description, 
    content, 
    tech_stack, 
    slug,
    views, 
    like_count, 
    comment_count, 
    category_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
      name,
      summary,
      alias,
      detail,
      JSON.stringify(techStacks),
      slug,
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
// export async function DELETE(req) {
//   try {
//     const { searchParams } = new URL(req.url);

//     const name = searchParams.get("name");

//     if (!name) {
//       return Response.json(
//         {
//           success: false,
//           message: "缺少 name"
//         },
//         { status: 400 }
//       );
//     }

//     const [result] = await db.query(
//       "DELETE FROM article WHERE title = ?",
//       [name]
//     );

//     console.log(result);

//     return Response.json({
//       success: true,
//       affectedRows: result.affectedRows
//     });

//   } catch (error) {
//     console.error("删除接口报错：", error);

//     return Response.json(
//       {
//         success: false,
//         message: error.message
//       },
//       { status: 500 }
//     );
//   }
// }
export async function DELETE(req) {
  // 从连接池获取一个数据库连接（用于事务）
  const connection = await db.getConnection();

  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    // 1. 参数校验
    if (!name) {
      return Response.json(
        { success: false, message: "缺少文章标题参数 name" },
        { status: 400 }
      );
    }

    // 2. 先查询要删除的文章所属的分类ID
    // 注意：这里假设你的article表有category_id字段关联category.id
    const [articles] = await connection.query(
      "SELECT category_id FROM article WHERE title = ?",
      [name]
    );

    // 文章不存在的情况
    if (articles.length === 0) {
      return Response.json(
        { success: false, message: "未找到标题为该名称的文章" },
        { status: 404 }
      );
    }

    // 获取文章所属分类ID（如果有多个相同标题的文章，取第一个的分类）
    const categoryId = articles[0].category_id;

    // 3. 开启事务：确保删除文章和更新分类数同时成功/失败
    await connection.beginTransaction();

    // 4. 执行删除文章操作
    const [deleteResult] = await connection.query(
      "DELETE FROM article WHERE title = ?",
      [name]
    );

    // 5. 更新对应分类的文章数量（自动统计真实数量，避免手动加减出错）
    await connection.query(
      `UPDATE category 
       SET article_count = (SELECT COUNT(*) FROM article WHERE category_id = ?)
       WHERE id = ?`,
      [categoryId, categoryId]
    );

    // 6. 提交事务
    await connection.commit();

    console.log(`成功删除文章：${name}，已更新分类${categoryId}的文章数`);
    return Response.json({
      success: true,
      affectedRows: deleteResult.affectedRows,
      message: "文章删除成功，分类文章数已更新"
    });

  } catch (error) {
    // 发生错误时回滚事务，保证数据一致性
    await connection.rollback();
    console.error("删除接口报错：", error);

    return Response.json(
      { success: false, message: "删除失败：" + error.message },
      { status: 500 }
    );

  } finally {
    // 无论成功失败，都要释放连接回连接池
    connection.release();
  }
}