/**
 * 博客布局外壳组件（Client Component）
 * 
 * 这是博客前台的核心布局组件，负责：
 * 1. 提供 BlogProvider 上下文（滚动状态、主题状态）
 * 2. 根据当前路径决定是否显示 Header 和 Footer
 * 3. 渲染页面特效（樱花、粒子连线等）
 * 4. 右下角固定工具栏（回到顶部、主题切换）
 * 5. 主题切换动画
 */
'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { BlogProvider, useBlogContext } from '@/context/BlogContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EffectManager from '@/components/EffectManager'
import styles from './BlogLayout.module.css'

const TOP_BUTTON_DRAG_THRESHOLD = 10
const TOP_BUTTON_SCROLL_GUARD_MS = 180

const normalizeWheelDelta = (event) => {
  if (event.deltaMode === 1) return event.deltaY * 16
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight
  return event.deltaY
}

function BlogLayoutInner({ children }) {
  const pathname = usePathname()
  const { scrollTop, headerVisible, blogTheme, toggleBlogTheme, isThemeAnimating } = useBlogContext()
  const topButtonGestureRef = useRef({ startX: 0, startY: 0, moved: false })
  const lastScrollAtRef = useRef(0)

  // 随笔页自带页脚，不显示公共 Footer
  const isEssayDetail = pathname.startsWith('/Essay')
  // 回到页面顶部
  const goToTop = () => {
    const gesture = topButtonGestureRef.current
    const justScrolled = performance.now() - lastScrollAtRef.current < TOP_BUTTON_SCROLL_GUARD_MS

    if (gesture.moved || justScrolled) {
      topButtonGestureRef.current = { startX: 0, startY: 0, moved: false }
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startTopButtonGesture = (clientX, clientY) => {
    topButtonGestureRef.current = { startX: clientX, startY: clientY, moved: false }
  }

  const updateTopButtonGesture = (clientX, clientY) => {
    const gesture = topButtonGestureRef.current

    if (
      Math.abs(clientX - gesture.startX) > TOP_BUTTON_DRAG_THRESHOLD ||
      Math.abs(clientY - gesture.startY) > TOP_BUTTON_DRAG_THRESHOLD
    ) {
      gesture.moved = true
    }
  }

  useEffect(() => {
    const markScroll = () => {
      lastScrollAtRef.current = performance.now()
    }

    window.addEventListener('scroll', markScroll, { passive: true })
    return () => window.removeEventListener('scroll', markScroll)
  }, [])

  const handleToolbarWheel = (event) => {
    const deltaY = normalizeWheelDelta(event)

    if (deltaY === 0) return

    event.preventDefault()
    window.scrollBy({ top: deltaY, left: event.deltaX, behavior: 'auto' })
  }

  // 组合布局根节点的 className：主题 + 动画状态
  const layoutClassName = [
    styles.layoutRoot,
    blogTheme === 'dark' ? styles.darkTheme : styles.lightTheme,
    blogTheme === 'dark' ? 'darkTheme' : 'lightTheme',
    isThemeAnimating ? styles.themeAnimating : ''
  ].join(' ')

  return (
    <div className={layoutClassName}>
      {/* 页面特效：根据路径显示不同的粒子/樱花效果 */}
      <EffectManager />
      <div className={styles.img}>
        {/* 显示顶部导航栏 */}
        <Header scrollTop={scrollTop} isVisible={headerVisible} />
        {/* 渲染子页面内容 */}
        {children}
        {/* 非随笔页显示公共页脚 */}
        {!isEssayDetail && <Footer />}
      </div>
      {/* 右下角固定工具栏 */}
      <div className={styles.Stickiness} onWheel={handleToolbarWheel}>
        {/* 回到顶部按钮：滚动超过 700px 时显示 */}
        <li
          className={`iconfont icon-lvxing ${styles.icon} ${scrollTop > 700 ? styles.showIcon : styles.hiddenIcon} ${styles.icon1}`}
          onPointerDown={(event) => startTopButtonGesture(event.clientX, event.clientY)}
          onPointerMove={(event) => updateTopButtonGesture(event.clientX, event.clientY)}
          onTouchStart={(event) => {
            const touch = event.touches[0]
            if (touch) startTopButtonGesture(touch.clientX, touch.clientY)
          }}
          onTouchMove={(event) => {
            const touch = event.touches[0]
            if (touch) updateTopButtonGesture(touch.clientX, touch.clientY)
          }}
          onClick={goToTop}
        ></li>
        {/* 主题切换按钮 */}
        <li
          className={`${styles.icon} ${styles.themeToggle} ${blogTheme === 'dark' ? styles.darkToggle : styles.lightToggle}`}
          aria-label={blogTheme === 'dark' ? '切换亮色主题' : '切换暗色主题'}
          title={blogTheme === 'dark' ? '切换亮色主题' : '切换暗色主题'}
          onClick={toggleBlogTheme}
        >
          <span aria-hidden="true"></span>
        </li>
      </div>
    </div>
  )
}

/**
 * 导出的外层组件，用 BlogProvider 包裹内层，提供上下文
 */
export default function BlogLayoutShell({ children }) {
  return (
    <BlogProvider>
      <BlogLayoutInner>{children}</BlogLayoutInner>
    </BlogProvider>
  )
}
