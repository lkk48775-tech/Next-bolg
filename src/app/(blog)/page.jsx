/**
 * 博客首页（Server Component）
 * 
 * 服务端渲染头图区域，文章列表由 HomePagination 客户端组件从后端获取数据渲染。
 */
export const dynamic = "force-dynamic";
import { Suspense } from 'react'
import Image from 'next/image'
import homeHeader from '@/assets/home-header-lite.webp'
import styles from './Home.module.css'
import HomePagination from '@/components/HomePagination'
import { getHomeSections } from '@/lib/homeSections'

function HomePaginationFallback() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 2 }, (_, sectionIndex) => (
        <div className={styles.box} key={`home-fallback-section-${sectionIndex}`}>
          <div className={styles.boxIntro}>
            <h2 style={{ visibility: 'hidden' }}>Loading</h2>
            <span style={{ visibility: 'hidden' }}>More</span>
          </div>
          <div className={styles.articleGrid}>
            {Array.from({ length: 6 }, (_, cardIndex) => (
              <div
                key={`home-fallback-card-${sectionIndex}-${cardIndex}`}
                style={{
                  minHeight: 'clamp(150px, 18vw, 210px)',
                  border: '1px solid rgb(235, 235, 235)',
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  boxShadow: '4px 6px 10px rgba(0, 0, 0, .07)'
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function Home() {
  const sections = await getHomeSections()

  return (
    <>
      {/* 头图区域 */}
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
          <div className={styles.textK}>
            <div className={styles.icons}>
              <svg className={styles.icon} aria-hidden="true">
                <use href="#icon-fenlei1"></use>
              </svg>
            </div>
            <span>欢迎访问：http://60.205.242.169</span>
          </div>

          {/* 文章列表 + 分页（从后端获取数据） */}
          <Suspense fallback={<HomePaginationFallback />}>
            <HomePagination initialSections={sections} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
