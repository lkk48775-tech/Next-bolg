/**
 * 顶部导航栏组件（Client Component）
 * 
 * 功能：
 * 1. 大屏幕：显示水平导航链接（首页、搜索、友链、归档、随笔）
 * 2. 小屏幕（<850px）：隐藏文字导航，显示菜单图标
 * 3. 点击菜单图标：从左侧滑出抽屉面板（65% 宽度），显示头像 + 导航链接
 * 4. 滚动状态控制：超过 270px 后变为白底毛玻璃效果，继续下滑则隐藏
 * 5. 特定页面（文章详情、归档、搜索、友链）不显示 hover 黑色背景
 */
'use client'

import { useEffect, useState } from 'react'
import styles from './Header.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import avatar from '@/assets/avatar.webp'

// 导航链接配置
const navLinks = [
  { href: '/', icon: '#icon-home', label: '首页' },
  { href: '/search', icon: '#icon-home1', label: '搜索' },
  { href: '/FriendChain', icon: '#icon-project1', label: '友链' },
  { href: '/TechnicalRoute', icon: '#icon--technology-', label: '归档' },
  { href: '/Essay', icon: '#icon-PDFqianming', label: '随笔' },
]

function Header({ scrollTop, isVisible = true }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pendingHref, setPendingHref] = useState('')
  const pathname = usePathname()

  // 动态加载 iconfont.js（SVG symbol 图标），避免 SSR 时访问 document
  useEffect(() => {
    import('@/assets/iconfont/iconfont.js')
  }, [])

  // 路由切换时自动关闭抽屉
  useEffect(() => {
    setDrawerOpen(false)
    setPendingHref('')
  }, [pathname])

  useEffect(() => {
    if (!pendingHref) return undefined

    const timer = window.setTimeout(() => {
      setPendingHref('')
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [pendingHref])

  // 抽屉打开时禁止 body 滚动
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // 这些页面顶部有自己的背景，导航栏 hover 时不叠加黑色背景
  const isArticleDetail = pathname.startsWith('/articles') ||
    pathname.startsWith('/TechnicalRoute') || pathname.startsWith('/Resume') ||
    pathname.startsWith('/search') || pathname.startsWith('/FriendChain')

  // 根据滚动距离和方向组合导航栏状态
  const headerClassName = [
    styles.nav,
    scrollTop > 270 ? styles.scrolledNav : '',           // 滚动后白底
    scrollTop > 270 && !isVisible ? styles.hiddenNav : '', // 下滑隐藏
    isArticleDetail ? styles.noHoverLayer : '',           // 特定页面不加 hover 背景
  ].filter(Boolean).join(' ')

  const handleLinkClick = (href) => {
    if (href === pathname) {
      setPendingHref('')
      return
    }

    setPendingHref(href)
  }

  return (
    <>
      {/* 顶部导航栏 */}
      <ul className={headerClassName}>
        {navLinks.map((link) => (
          <Link
            href={link.href}
            className={`${styles.options} ${pendingHref === link.href ? styles.pendingLink : ''}`}
            key={link.href}
            onClick={() => handleLinkClick(link.href)}
          >
            <svg className={styles.icon} aria-hidden="true">
              <use href={link.icon}></use>
            </svg>
            <span>{link.label}</span>
            <div className={styles.transtion}></div>
          </Link>
        ))}

        {/* 小屏幕菜单按钮 */}
        <li className={styles.brief} onClick={() => setDrawerOpen(true)}>
          <i className={`iconfont icon-RectangleCopy10 ${styles.navIcon}`}></i>
        </li>
      </ul>

      {/* 移动端侧边抽屉遮罩层 */}
      <div
        className={`${styles.overlay} ${drawerOpen ? styles.overlayVisible : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      {/* 移动端侧边抽屉面板 */}
      <aside className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        {/* 抽屉头部：头像 + 名字 + 描述 */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerAvatar}>
            <Image src={avatar} alt="头像" width={72} height={72} />
          </div>
          <span className={styles.drawerName}>Sakura</span>
          <p className={styles.drawerDesc}>记录前端、算法和项目实践</p>
        </div>
        {/* 抽屉导航链接 */}
        <nav className={styles.drawerNav}>
          {navLinks.map((link) => (
            <Link
              href={link.href}
              className={`${styles.drawerLink} ${pathname === link.href ? styles.drawerLinkActive : ''}`}
              key={link.href}
              onClick={() => {
                handleLinkClick(link.href)
                setDrawerOpen(false)
              }}
            >
              <svg className={styles.drawerIcon} aria-hidden="true">
                <use href={link.icon}></use>
              </svg>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Header
