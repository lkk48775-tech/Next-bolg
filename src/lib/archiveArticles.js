import { unstable_cache } from 'next/cache'
import db from '@/lib/db'

const loadArchiveArticles = unstable_cache(
  async () => {
    const [rows] = await db.query(`
      SELECT
        a.id,
        a.title,
        a.description,
        a.summary,
        a.slug,
        a.created_at,
        c.name AS category_name
      FROM article a
      LEFT JOIN category c ON a.category_id = c.id
      WHERE a.published = 1
      ORDER BY a.created_at DESC
    `)

    return rows
  },
  ['archive-articles'],
  {
    revalidate: 300,
    tags: ['archive-articles'],
  }
)

export async function getArchiveArticles() {
  return loadArchiveArticles()
}
