import Link from 'next/link'
import styles from './admin.module.css'

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Sakura Admin</div>
        <nav className={styles.nav}>
          <Link href="/admin">仪表盘</Link>
          <Link href="/admin/sections">专题管理</Link>
          <Link href="/admin/tags">文章管理</Link>
        </nav>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
