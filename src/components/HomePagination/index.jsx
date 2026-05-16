'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ArticleCard from '@/components/ArticleCard'
import styles from '@/app/(blog)/Home.module.css'

const PAGE_SIZE = 2

export default function HomePagination({ initialSections = [] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  const validSections = useMemo(() => {
    return initialSections.filter((section) => section.articles && section.articles.length >= 4)
  }, [initialSections])

  const pageCount = Math.max(1, Math.ceil(validSections.length / PAGE_SIZE))

  const currentSections = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return validSections.slice(start, start + PAGE_SIZE)
  }, [validSections, currentPage])

  const changePage = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), pageCount)
    const params = new URLSearchParams()
    if (safePage !== 1) params.set('page', String(safePage))
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const goToSearch = (categoryName) => {
    router.push(`/search?keyword=${encodeURIComponent(categoryName)}`)
  }

  return (
    <>
      {currentSections.map((section) => (
        <div className={styles.box} key={section.category}>
          <div className={styles.boxIntro}>
            <h2>{section.category}</h2>
            <span onClick={() => goToSearch(section.category)} style={{ cursor: 'pointer' }}>更多</span>
          </div>
          <div className={styles.articleGrid}>
            {section.articles.slice(0, 6).map((article) => (
              <ArticleCard
                key={`${section.category}-${article.title}`}
                slug={`${section.category.toLowerCase()}/${article.slug}`}
                meta={article.title}
                title={article.description || section.category}
                desc={article.summary}
                tags={(() => {
                  try { return JSON.parse(article.tech_stack) } catch { return [] }
                })()}
              />
            ))}
          </div>
        </div>
      ))}

      {validSections.length > PAGE_SIZE && (
        <div className={styles.pagination}>
          <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>
            上一页
          </button>
          {Array.from({ length: pageCount }, (_, index) => {
            const page = index + 1
            return (
              <button
                type="button"
                className={currentPage === page ? styles.activePage : ''}
                key={page}
                onClick={() => changePage(page)}
              >
                {page}
              </button>
            )
          })}
          <button type="button" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>
            下一页
          </button>
        </div>
      )}
    </>
  )
}
