import { getHomeSectionsPage } from '@/lib/homeSections'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page')) || 1
    const pageSize = Number(searchParams.get('pageSize')) || 2
    const data = await getHomeSectionsPage(page, pageSize)

    return Response.json({
      code: 200,
      data
    })
  } catch (err) {
    return Response.json({
      code: 500,
      msg: err.message,
    })
  }
}
