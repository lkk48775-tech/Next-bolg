import HoverPrefetchLink from '@/components/HoverPrefetchLink'
import styles from './TechnicalRoute.module.css'

export default function ArchiveTimeline({ articles = [] }) {
  const archiveGroups = articles.reduce((groups, article) => {
    const date = new Date(article.created_at)
    const year = date.getFullYear().toString()

    if (!groups[year]) {
      groups[year] = []
    }

    groups[year].push({
      ...article,
      dateStr: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    })

    return groups
  }, {})

  const sortedYears = Object.keys(archiveGroups).sort((a, b) => Number(b) - Number(a))

  return (
    <section className={styles.archiveCard} data-archive-card>
      <header className={styles.archiveHeader}>
        <h2>文章归档</h2>
        <p>共 {articles.length} 篇文章</p>
      </header>
      <div className={styles.archiveTimeline}>
        {sortedYears.map((year) => (
          <section className={styles.yearGroup} key={year}>
            <h3>{year}</h3>
            <div className={styles.archiveList}>
              {archiveGroups[year].map((article) => (
                <HoverPrefetchLink
                  className={styles.archiveEntry}
                  href={`/articles/${(article.category_name || '').toLowerCase()}/${article.slug}`}
                  key={article.id}
                >
                  <time>{article.dateStr}</time>
                  <span>{article.description || article.title}</span>
                </HoverPrefetchLink>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
