import { getCurrentDbUser } from "@/lib/sessionUser"
import db from "@/lib/db"

const getArticleId = (value) => {
  const nextValue = Number(value)
  return Number.isInteger(nextValue) && nextValue > 0 ? nextValue : null
}

export async function POST(req, context) {
  const connection = await db.getConnection()

  try {
    const dbUser = await getCurrentDbUser()

    if (!dbUser?.id) {
      return Response.json({ code: 401, msg: "请先通过 GitHub 登录后再点赞" }, { status: 401 })
    }

    const { articleId: rawArticleId } = await context.params
    const articleId = getArticleId(rawArticleId)

    if (!articleId) {
      return Response.json({ code: 400, msg: "无效的文章 ID" }, { status: 400 })
    }

    await connection.beginTransaction()

    const [articleRows] = await connection.query(
      `
        SELECT id
        FROM \`article\`
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [articleId]
    )

    if (!articleRows.length) {
      await connection.rollback()
      return Response.json({ code: 404, msg: "文章不存在" }, { status: 404 })
    }

    const [likedRows] = await connection.query(
      `
        SELECT id
        FROM \`article_like\`
        WHERE article_id = ? AND user_id = ?
        LIMIT 1
      `,
      [articleId, dbUser.id]
    )

    const nextLiked = likedRows.length === 0

    if (nextLiked) {
      await connection.query(
        `
          INSERT INTO \`article_like\` (article_id, user_id)
          VALUES (?, ?)
        `,
        [articleId, dbUser.id]
      )

      await connection.query(
        `
          UPDATE \`article\`
          SET like_count = like_count + 1
          WHERE id = ?
        `,
        [articleId]
      )
    } else {
      await connection.query(
        `
          DELETE FROM \`article_like\`
          WHERE article_id = ? AND user_id = ?
        `,
        [articleId, dbUser.id]
      )

      await connection.query(
        `
          UPDATE \`article\`
          SET like_count = GREATEST(like_count - 1, 0)
          WHERE id = ?
        `,
        [articleId]
      )
    }

    const [rows] = await connection.query(
      `
        SELECT like_count
        FROM \`article\`
        WHERE id = ?
        LIMIT 1
      `,
      [articleId]
    )

    await connection.commit()

    return Response.json({
      code: 200,
      msg: nextLiked ? "点赞成功" : "已取消点赞",
      data: {
        id: articleId,
        likeCount: rows[0]?.like_count || 0,
        liked: nextLiked,
      },
    })
  } catch (error) {
    await connection.rollback()
    return Response.json({ code: 500, msg: error.message || "点赞失败" }, { status: 500 })
  } finally {
    connection.release()
  }
}
