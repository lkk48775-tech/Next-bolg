import { unstable_cache } from 'next/cache'
import db from '@/lib/db'

const DEFAULT_HOME_PAGE_SIZE = 2

const loadAllHomeSections = unstable_cache(
  async () => {
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

    return Object.values(grouped).filter((section) => section.articles && section.articles.length >= 4)
  },
  ['home-sections'],
  {
    revalidate: 300,
    tags: ['home-sections'],
  }
)

export async function getHomeSections() {
  return loadAllHomeSections()
}

export async function getHomeSectionsPage(page = 1, pageSize = DEFAULT_HOME_PAGE_SIZE) {
  const allSections = await loadAllHomeSections()
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_HOME_PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(allSections.length / safePageSize))
  const safePage = Math.min(Math.max(Number(page) || 1, 1), pageCount)
  const start = (safePage - 1) * safePageSize

  return {
    page: safePage,
    pageCount,
    pageSize: safePageSize,
    totalSections: allSections.length,
    sections: allSections.slice(start, start + safePageSize),
  }
}
