/**
 * 管理后台布局组件（Server Component）
 * 
 * 这是 (admin) 路由组的布局文件，所有 /admin 下的页面都会使用这个布局。
 * 布局包含：左侧固定侧边栏导航 + 右侧主内容区。
 * 
 * 通过 AdminProviders 包裹 SessionProvider，让所有子页面都能使用 next-auth 的会话功能。
 */
import Link from 'next/link'
import styles from './admin.module.css'
import AdminProviders from './AdminProviders'

export default function AdminLayout({ children }) {
  return (
    // AdminProviders 提供 next-auth 的 SessionProvider 上下文
    <AdminProviders>
      <div className={styles.adminRoot}>
        {/* 左侧侧边栏：Logo + 导航链接 */}
        <aside className={styles.sidebar}>
          <div className={styles.logo}>Sakura Admin</div>
          <nav className={styles.nav}>
            <Link href="/admin">仪表盘</Link>
            <Link href="/admin/sections">专题管理</Link>
            <Link href="/admin/tags">文章管理</Link>
          </nav>
        </aside>
        {/* 右侧主内容区：渲染子页面 */}
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </AdminProviders>
  )
}
