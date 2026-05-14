/**
 * 博客首页（Server Component）
 * 
 * 服务端渲染的部分：
 * - 头图区域（背景图 + 打字机文字 + 波浪装饰）
 * - 欢迎信息栏
 * 
 * 客户端渲染的部分（拆分到 HomePagination）：
 * - 文章卡片列表
 * - 分页按钮交互
 * 
 * 分页状态通过 URL 参数 ?page=2 管理，
 * 服务端根据参数计算当前页数据，传给客户端组件。
 */
import { Suspense } from 'react'
import Image from 'next/image'
import { techSections } from '@/data/articleMetaData'
import homeHeader from '@/assets/home-header-lite.webp'
import styles from './Home.module.css'
import HomePagination from '@/components/HomePagination'

export default async function Home({ searchParams }) {
  // Next.js 15 中 searchParams 是 Promise，需要 await
  const params = await searchParams
  const currentPage = Number(params?.page) || 1
  const PAGE_SIZE = 2
  const pageCount = Math.ceil(techSections.length / PAGE_SIZE)
  const start = (currentPage - 1) * PAGE_SIZE
  const currentTechSections = techSections.slice(start, start + PAGE_SIZE)

  return (
    <>
      {/* 头图区域：全宽背景图 + 打字机效果文字 + 波浪装饰 */}
      <div className={styles.header}>
        <Image
          className={styles.headerImage}
          src={homeHeader}
          alt=""
          priority
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className={styles.headerText}>
          <span>愿每一次敲下代码，都离理想中的自己更近一点。</span>
        </div>
        <div className={styles.bannerWare1}></div>
        <div className={styles.bannerWare2}></div>
      </div>

      {/* 主内容区 */}
      <div className={styles.main}>
        <div className={styles.right}>
          {/* 欢迎信息栏 */}
          <div className={styles.textK}>
            <div className={styles.icons}>
              <svg className={styles.icon} aria-hidden="true">
                <use href="#icon-fenlei1"></use>
              </svg>
            </div>
            <span>欢迎访问：http://60.205.242.169</span>
          </div>

          {/* 文章列表 + 分页（客户端交互部分） */}
          <Suspense fallback={null}>
            <HomePagination
              currentTechSections={currentTechSections}
              currentPage={currentPage}
              pageCount={pageCount}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}
