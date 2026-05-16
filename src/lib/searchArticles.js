import db from '@/lib/db'

export async function searchArticles(keyword = '') {
  const normalizedKeyword = keyword.trim()

  if (!normalizedKeyword) {
    const [rows] = await db.query(`
      SELECT 
        a.id,
        a.title,
        a.summary,
        a.description,
        a.slug,
        a.tech_stack,
        a.created_at,
        c.name AS category_name
      FROM article a
      LEFT JOIN category c ON a.category_id = c.id
      WHERE a.published = 1
      ORDER BY a.created_at DESC
    `)

    return rows
  }

  const likeKeyword = `%${normalizedKeyword}%`
  const [rows] = await db.query(`
    SELECT 
      a.id,
      a.title,
      a.summary,
      a.description,
      a.slug,
      a.tech_stack,
      a.created_at,
      c.name AS category_name,
      (
        (CASE WHEN a.title LIKE ? THEN 1 ELSE 0 END) +
        (CASE WHEN a.summary LIKE ? THEN 1 ELSE 0 END) +
        (CASE WHEN a.description LIKE ? THEN 1 ELSE 0 END) +
        (CASE WHEN c.name LIKE ? THEN 1 ELSE 0 END)
      ) AS match_score
    FROM article a
    LEFT JOIN category c ON a.category_id = c.id
    WHERE a.published = 1
      AND (
        a.title LIKE ? OR
        a.summary LIKE ? OR
        a.description LIKE ? OR
        c.name LIKE ?
      )
    ORDER BY match_score DESC, a.created_at DESC
  `, [
    likeKeyword, likeKeyword, likeKeyword, likeKeyword,
    likeKeyword, likeKeyword, likeKeyword, likeKeyword
  ])

  return rows
}
