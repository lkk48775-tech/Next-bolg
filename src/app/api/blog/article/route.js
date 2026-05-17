import { getCurrentDbUser } from '@/lib/sessionUser'
import { getArticleBySlug } from '@/lib/articleDetail'
import db from '@/lib/db'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return Response.json({ code: 400, msg: '缺少 slug 参数' }, { status: 400 })
    }

    const article = await getArticleBySlug(slug)

    if (!article) {
      return Response.json({ code: 404, msg: '文章不存在' }, { status: 404 })
    }

    const currentDbUser = await getCurrentDbUser().catch(() => null)
    let liked = false

    if (currentDbUser?.id) {
      const [likedRows] = await db.query(
        `
          SELECT id
          FROM article_like
          WHERE article_id = ? AND user_id = ?
          LIMIT 1
        `,
        [article.id, currentDbUser.id]
      )

      liked = likedRows.length > 0
    }

    return Response.json({
      code: 200,
      data: {
        ...article,
        likeCount: article.like_count || 0,
        liked,
      },
    })
  } catch (err) {
    return Response.json({ code: 500, msg: err.message }, { status: 500 })
  }
}
