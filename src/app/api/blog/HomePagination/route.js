import { getHomeSections } from '@/lib/homeSections'

export async function GET() {
  try {
    const data = await getHomeSections()

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
