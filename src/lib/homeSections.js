import db from '@/lib/db'

export async function getHomeSections() {
  const [result] = await db.query(`
    SELECT
      category.name AS category_name,
      category.article_count,
      article.title,
      article.summary,
      article.slug,
      article.tech_stack,
      article.description
    FROM category
    LEFT JOIN article
      ON article.category_id = category.id
      AND article.published = 1
  `)

  const grouped = result.reduce((acc, item) => {
    const name = item.category_name

    if (!acc[name]) {
      acc[name] = {
        category: name,
        article_count: item.article_count,
        articles: []
      }
    }

    if (item.title) {
      acc[name].articles.push({
        title: item.title,
        summary: item.summary,
        slug: item.slug,
        tech_stack: item.tech_stack,
        description: item.description
      })
    }

    return acc
  }, {})

  return Object.values(grouped)
}
