import { getCurrentDbUser } from "@/lib/sessionUser"
import db from "@/lib/db"

const getCommentId = (value) => {
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

    const { commentId: rawCommentId } = await context.params
    const commentId = getCommentId(rawCommentId)

    if (!commentId) {
      return Response.json({ code: 400, msg: "无效的评论 ID" }, { status: 400 })
    }

    await connection.beginTransaction()

    const [commentRows] = await connection.query(
      `
        SELECT id
        FROM \`comment\`
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [commentId]
    )

    if (!commentRows.length) {
      await connection.rollback()
      return Response.json({ code: 404, msg: "评论不存在" }, { status: 404 })
    }

    const [likedRows] = await connection.query(
      `
        SELECT id
        FROM \`comment_like\`
        WHERE comment_id = ? AND user_id = ?
        LIMIT 1
      `,
      [commentId, dbUser.id]
    )

    const nextLiked = likedRows.length === 0

    if (nextLiked) {
      await connection.query(
        `
          INSERT INTO \`comment_like\` (comment_id, user_id)
          VALUES (?, ?)
        `,
        [commentId, dbUser.id]
      )

      await connection.query(
        `
          UPDATE \`comment\`
          SET like_count = like_count + 1
          WHERE id = ?
        `,
        [commentId]
      )
    } else {
      await connection.query(
        `
          DELETE FROM \`comment_like\`
          WHERE comment_id = ? AND user_id = ?
        `,
        [commentId, dbUser.id]
      )

      await connection.query(
        `
          UPDATE \`comment\`
          SET like_count = GREATEST(like_count - 1, 0)
          WHERE id = ?
        `,
        [commentId]
      )
    }

    const [rows] = await connection.query(
      `
        SELECT like_count
        FROM \`comment\`
        WHERE id = ?
        LIMIT 1
      `,
      [commentId]
    )

    await connection.commit()

    return Response.json({
      code: 200,
      msg: nextLiked ? "点赞成功" : "已取消点赞",
      data: {
        id: commentId,
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
