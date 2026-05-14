/**
 * 博客全局上下文（Client Component）
 * 
 * 提供以下共享状态给所有博客前台页面：
 * - scrollTop: 当前滚动位置（分档：0 / 271 / 701，避免频繁更新）
 * - headerVisible: 导航栏是否可见（上滑显示、下滑隐藏）
 * - blogTheme: 当前主题（'light' | 'dark'）
 * - toggleBlogTheme: 切换主题的方法
 * - isThemeAnimating: 主题切换动画是否正在播放
 * 
 * 主题状态持久化到 sessionStorage，刷新后保持。
 */
'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'

// 创建上下文，提供默认值
const BlogContext = createContext({
  scrollTop: 0,
  headerVisible: true,
  blogTheme: 'light',
  toggleBlogTheme: () => {},
})

// 滚动相关常量
const HEADER_HIDE_POINT = 270        // 超过这个距离后，导航栏根据滚动方向显示/隐藏
const SCROLL_DIRECTION_THRESHOLD = 4  // 滚动方向判断的最小像素阈值
const BLOG_THEME_STORAGE_KEY = 'blog-layout-theme'

/**
 * 从 sessionStorage 读取已保存的主题
 */
const getStoredBlogTheme = () => {
  if (typeof window === 'undefined') return 'light'
  const storedTheme = window.sessionStorage.getItem(BLOG_THEME_STORAGE_KEY)
  return storedTheme === 'dark' ? 'dark' : 'light'
}

/**
 * BlogProvider - 博客上下文提供者
 * 包裹在博客布局外层，管理滚动和主题状态
 */
export function BlogProvider({ children }) {
  const [scrollTop, setScrollTop] = useState(0)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [blogTheme, setBlogTheme] = useState('light')
  const [isThemeAnimating, setIsThemeAnimating] = useState(false)
  const lastScrollYRef = useRef(0)
  const themeAnimationTimerRef = useRef(null)

  // 客户端挂载后读取存储的主题
  useEffect(() => {
    setBlogTheme(getStoredBlogTheme())
  }, [])

  // 监听滚动事件，更新滚动状态和导航栏可见性
  useEffect(() => {
    function handleScroll() {
      const top = window.scrollY
      // 只保留三个档位（0 / 271 / 701），避免每像素都触发子组件重渲染
      const nextScrollTop = top > 700 ? 701 : top > 270 ? 271 : 0
      const scrollDelta = top - lastScrollYRef.current

      setScrollTop((prev) => (prev === nextScrollTop ? prev : nextScrollTop))

      // 在顶部区域内导航栏永远显示；离开后按滚动方向控制
      if (top <= HEADER_HIDE_POINT) {
        setHeaderVisible(true)
      } else if (Math.abs(scrollDelta) > SCROLL_DIRECTION_THRESHOLD) {
        setHeaderVisible(scrollDelta < 0) // 上滑显示，下滑隐藏
      }

      if (Math.abs(scrollDelta) > SCROLL_DIRECTION_THRESHOLD) {
        lastScrollYRef.current = top
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 主题变化时持久化到 sessionStorage
  useEffect(() => {
    window.sessionStorage.setItem(BLOG_THEME_STORAGE_KEY, blogTheme)
  }, [blogTheme])

  // 组件卸载时清理动画定时器
  useEffect(() => () => {
    window.clearTimeout(themeAnimationTimerRef.current)
  }, [])

  /**
   * 切换主题，并触发 720ms 的过渡动画
   */
  const toggleBlogTheme = () => {
    window.clearTimeout(themeAnimationTimerRef.current)
    setIsThemeAnimating(true)
    setBlogTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
    themeAnimationTimerRef.current = window.setTimeout(() => {
      setIsThemeAnimating(false)
    }, 720)
  }

  return (
    <BlogContext.Provider value={{ scrollTop, headerVisible, blogTheme, toggleBlogTheme, isThemeAnimating }}>
      {children}
    </BlogContext.Provider>
  )
}

/**
 * 自定义 Hook：在子组件中获取博客上下文
 */
export function useBlogContext() {
  return useContext(BlogContext)
}
