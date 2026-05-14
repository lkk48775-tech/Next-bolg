/**
 * 归档页面（Server Component）
 * 
 * 服务端渲染文章时间线，按年份分组展示所有文章。
 * 左侧是个人简介 + 导航（sticky 定位），右侧是文章归档时间线。
 * 
 * 只有外层的 ArchiveShell 是客户端组件（用于测量卡片高度），
 * 内部所有内容都是服务端渲染的。
 */
import Link from 'next/link'
import { allHomeArticles } from '@/data/articleMetaData'
import { getArticlePath } from '@/content/articlePath'
import styles from './TechnicalRoute.module.css'
import ArchiveShell from '@/components/ArchiveShell'

const archiveDates = [
  '2026-05-07','2026-04-25','2026-04-04','2026-03-31','2026-03-27',
  '2026-03-17','2026-02-25','2026-01-15','2026-01-04','2025-12-19',
  '2025-09-11','2025-08-26','2025-07-18','2025-06-02','2025-05-16',
  '2025-04-09','2025-03-22','2025-02-14','2025-01-08','2024-12-23',
  '2024-11-05','2024-10-18','2024-09-01','2024-08-12','2024-07-26',
  '2024-06-06','2024-05-21','2024-04-13','2024-03-08','2024-02-19',
  '2024-01-10'
]

const navItems = [
  { icon: 'icon-home', label: '首页', to: '/' },
  { icon: 'icon-home1', label: '搜索', to: '/search' },
  { icon: 'icon-project1', label: '友链', to: '/FriendChain' },
  { icon: 'icon-shuben', label: '归档', to: '/TechnicalRoute', active: true },
  { icon: 'icon-a-201_biji', label: '随笔', to: '/Essay' }
]

const archiveItems = allHomeArticles.map((article, index) => ({
  ...article,
  date: archiveDates[index] || '2024-01-01'
}))

const archiveGroups = archiveItems.reduce((groups, article) => {
  const year = article.date.slice(0, 4)
  return { ...groups, [year]: [...(groups[year] || []), article] }
}, {})

const sortedYears = Object.keys(archiveGroups).sort((a, b) => Number(b) - Number(a))

export default function TechnicalRoutePage() {
  return (
    <>
      <div className={styles.hly}></div>
      <ArchiveShell>
        <aside className={styles.profile}>
          <div className={styles.profileInner}>
            <div className={styles.avatarSprite} aria-label="Erii 动画头像"></div>
            <div className={styles.profileText}>
              <h1>Skaura</h1>
              <p>记录前端、算法和项目实践</p>
            </div>
            <nav className={styles.sideNav} aria-label="归档导航">
              {navItems.map((item) => (
                <Link
                  className={`${styles.navItem} ${item.active ? styles.activeNavItem : ''}`}
                  href={item.to}
                  key={item.label}
                >
                  <i className={`iconfont ${item.icon}`} aria-hidden="true"></i>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <section className={styles.archiveCard} data-archive-card>
          <header className={styles.archiveHeader}>
            <h2>文章归档</h2>
            <p>共 {archiveItems.length} 篇文章</p>
          </header>
          <div className={styles.archiveTimeline}>
            {sortedYears.map((year) => (
              <section className={styles.yearGroup} key={year}>
                <h3>{year}</h3>
                <div className={styles.archiveList}>
                  {archiveGroups[year].map((article) => (
                    <Link
                      className={styles.archiveEntry}
                      href={`/articles/${getArticlePath(article.slug)}`}
                      key={article.slug}
                    >
                      <time dateTime={article.date}>{article.date.slice(5)}</time>
                      <span>{article.title}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </ArchiveShell>
    </>
  )
}
