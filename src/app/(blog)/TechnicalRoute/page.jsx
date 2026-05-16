/**
 * 归档页面
 * 
 * 左侧个人简介 + 导航，右侧文章归档时间线（从后端获取数据）。
 */
import Link from 'next/link'
import styles from './TechnicalRoute.module.css'
import ArchiveShell from '@/components/ArchiveShell'
import ArchiveTimeline from './ArchiveTimeline'

const navItems = [
  { label: '首页', to: '/' },
  { label: '搜索', to: '/search' },
  { label: '友链', to: '/FriendChain' },
  { label: '归档', to: '/TechnicalRoute', active: true },
  { label: '随笔', to: '/Essay' }
]

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
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* 归档时间线：从后端获取数据 */}
        <ArchiveTimeline />
      </ArchiveShell>
    </>
  )
}
