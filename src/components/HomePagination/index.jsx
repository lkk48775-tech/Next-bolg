/**
 * 首页分页交互组件（Client Component）
 * 
 * 从首页 Server Component 接收当前页的文章数据和分页信息，
 * 负责渲染文章卡片列表和分页按钮的交互逻辑。
 * 
 * 为什么拆出来？
 * - 分页按钮需要 useRouter 进行客户端导航
 * - "更多" 按钮需要跳转到搜索页
 * - 首页的头图和静态内容保持服务端渲染，只有这部分需要客户端
 * 
 * Props:
 * - currentTechSections: 当前页要显示的专题数组
 * - currentPage: 当前页码
 * - pageCount: 总页数
 */
'use client'

import { useRouter } from 'next/navigation'
import ArticleCard from '@/components/ArticleCard'
import styles from '@/app/(blog)/Home.module.css'

export default function HomePagination({ currentTechSections, currentPage, pageCount }) {
  const router = useRouter()

  // 切换页码：更新 URL 参数并滚动到内容区
  const changePage = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), pageCount)
    const params = new URLSearchParams()
    if (safePage !== 1) params.set('page', safePage)
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  // 点击"更多"跳转到搜索页，带上专题名作为关键词
  const goToSearch = (sectionTitle) => {
    const cleanTitle = sectionTitle.replace('介绍', '')
    router.push(`/search?keyword=${encodeURIComponent(cleanTitle)}`)
  }

  return (
    <>
      {/* 渲染当前页的专题和文章卡片 */}
      {currentTechSections.map((section) => (
        <div className={styles.box} key={section.title}>
          <div className={styles.boxIntro}>
            <h2>{section.title}</h2>
            <span onClick={() => goToSearch(section.title)} style={{ cursor: 'pointer' }}>更多</span>
          </div>
          <div className={styles.articleGrid}>
            {section.items.map((article) => (
              <ArticleCard
                key={`${section.title}-${article.meta}`}
                slug={article.slug}
                meta={article.meta}
                title={article.title}
                desc={article.desc}
                tags={article.tags}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 分页按钮 */}
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
    </>
  )
}
