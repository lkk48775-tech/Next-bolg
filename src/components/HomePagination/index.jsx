'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ArticleCard from '@/components/ArticleCard'
import styles from '@/app/(blog)/Home.module.css'

const PAGE_SIZE = 2

const getInitialPageFromLocation = () => {
  if (typeof window === 'undefined') return 1

  const page = Number(new URLSearchParams(window.location.search).get('page')) || 1
  return Math.max(page, 1)
}

export default function HomePagination({
  initialSections = [],
  initialPage = 1,
  initialPageCount = 1,
}) {
  const router = useRouter()
  const [sections, setSections] = useState(initialSections)
  const [pageCount, setPageCount] = useState(initialPageCount)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSections(initialSections)
    setPageCount(initialPageCount)
    setCurrentPage(initialPage)
  }, [initialPage, initialPageCount, initialSections])

  useEffect(() => {
    const pageFromUrl = getInitialPageFromLocation()

    if (pageFromUrl === initialPage) return

    let cancelled = false

    const fetchPage = async () => {
      setCurrentPage(pageFromUrl)
      setLoading(true)

      try {
        const response = await fetch(`/api/blog/HomePagination?page=${pageFromUrl}&pageSize=${PAGE_SIZE}`, {
          cache: 'no-store',
        })
        const payload = await response.json()

        if (!response.ok || payload.code !== 200) {
          throw new Error(payload.msg || '加载首页内容失败')
        }

        if (cancelled) return

        setSections(payload.data.sections || [])
        setPageCount(payload.data.pageCount || 1)
      } catch (error) {
        if (!cancelled) {
          console.error(error)
          setSections([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchPage()

    return () => {
      cancelled = true
    }
  }, [initialPage])

  const changePage = async (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), pageCount)
    if (safePage === currentPage) return

    setLoading(true)

    try {
      const response = await fetch(`/api/blog/HomePagination?page=${safePage}&pageSize=${PAGE_SIZE}`, {
        cache: 'no-store',
      })
      const payload = await response.json()

      if (!response.ok || payload.code !== 200) {
        throw new Error(payload.msg || '加载首页内容失败')
      }

      setSections(payload.data.sections || [])
      setPageCount(payload.data.pageCount || 1)
      setCurrentPage(payload.data.page || safePage)

      const url = payload.data.page > 1 ? `/?page=${payload.data.page}` : '/'
      window.history.pushState(null, '', url)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {sections.map((section) => (
        <div className={styles.box} key={section.category}>
          <div className={styles.boxIntro}>
            <h2>{section.category}</h2>
            <span
              onMouseEnter={() => {
                router.prefetch(`/search?keyword=${encodeURIComponent(section.category)}`)
              }}
              onClick={() => {
                router.push(`/search?keyword=${encodeURIComponent(section.category)}`)
              }}
              style={{ cursor: 'pointer' }}
            >
              更多
            </span>
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

      {loading && (
        <div className={styles.paginationHint} aria-live="polite">
          页面内容加载中...
        </div>
      )}

      {pageCount > 1 && (
        <div className={styles.pagination}>
          <button type="button" disabled={currentPage === 1 || loading} onClick={() => void changePage(currentPage - 1)}>
            上一页
          </button>
          {Array.from({ length: pageCount }, (_, index) => {
            const page = index + 1

            return (
              <button
                type="button"
                className={currentPage === page ? styles.activePage : ''}
                disabled={loading}
                key={page}
                onClick={() => void changePage(page)}
              >
                {page}
              </button>
            )
          })}
          <button type="button" disabled={currentPage === pageCount || loading} onClick={() => void changePage(currentPage + 1)}>
            下一页
          </button>
        </div>
      )}
    </>
  )
}
