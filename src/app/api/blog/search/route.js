import { searchArticles } from '@/lib/searchArticles'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const keyword = searchParams.get('keyword') || ''
    const rows = await searchArticles(keyword)

    return Response.json({ code: 200, data: rows })
  } catch (err) {
    return Response.json({ code: 500, msg: err.message })
  }
}
