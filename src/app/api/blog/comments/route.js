import { getArticleComments } from "@/lib/commentService"
import { getCurrentDbUser } from "@/lib/sessionUser"
import db from "@/lib/db"

const getArticleId = (value) => {
  const nextValue = Number(value)
  return Number.isInteger(nextValue) && nextValue > 0 ? nextValue : null
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const articleId = getArticleId(searchParams.get("articleId"))

    if (!articleId) {
      return Response.json({ code: 400, msg: "缺少有效的 articleId 参数" }, { status: 400 })
    }

    const currentDbUser = await getCurrentDbUser().catch(() => null)
    const comments = await getArticleComments(articleId, currentDbUser?.id || null)
    return Response.json({ code: 200, data: comments })
  } catch (error) {
    return Response.json({ code: 500, msg: error.message || "加载评论失败" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const dbUser = await getCurrentDbUser()

    if (!dbUser?.id) {
      return Response.json({ code: 401, msg: "请先通过 GitHub 登录后再评论" }, { status: 401 })
    }

    const body = await req.json()
    const articleId = getArticleId(body?.articleId)
    const parentId = body?.parentId == null ? null : getArticleId(body.parentId)
    const content = typeof body?.content === "string" ? body.content.trim() : ""

    if (!articleId) {
      return Response.json({ code: 400, msg: "缺少有效的文章 ID" }, { status: 400 })
    }

    if (!content) {
      return Response.json({ code: 400, msg: "评论内容不能为空" }, { status: 400 })
    }

    if (content.length > 2000) {
      return Response.json({ code: 400, msg: "评论内容不能超过 2000 字" }, { status: 400 })
    }

    const [articles] = await db.query(
      `
        SELECT id
        FROM \`article\`
        WHERE id = ?
        LIMIT 1
      `,
      [articleId]
    )

    if (!articles.length) {
      return Response.json({ code: 404, msg: "文章不存在" }, { status: 404 })
    }

    let rootId = null

    if (body?.parentId != null && !parentId) {
      return Response.json({ code: 400, msg: "回复目标无效" }, { status: 400 })
    }

    if (parentId) {
      const [parentRows] = await db.query(
        `
          SELECT id, article_id, parent_id, root_id
          FROM \`comment\`
          WHERE id = ?
          LIMIT 1
        `,
        [parentId]
      )

      const parentComment = parentRows[0]

      if (!parentComment || Number(parentComment.article_id) !== articleId) {
        return Response.json({ code: 404, msg: "回复目标不存在" }, { status: 404 })
      }

      rootId = parentComment.root_id || parentComment.id
    }

    const [result] = await db.query(
      `
        INSERT INTO \`comment\` (content, like_count, reply_count, article_id, user_id, parent_id, root_id)
        VALUES (?, 0, 0, ?, ?, ?, ?)
      `,
      [content, articleId, dbUser.id, parentId, rootId]
    )

    if (rootId) {
      await db.query(
        `
          UPDATE \`comment\`
          SET reply_count = reply_count + 1
          WHERE id = ?
        `,
        [rootId]
      )
    }

    return Response.json({
      code: 200,
      msg: "评论发布成功",
      data: { id: result.insertId },
    })
  } catch (error) {
    return Response.json({ code: 500, msg: error.message || "评论发布失败" }, { status: 500 })
  }
}
