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

import { usePathname } from 'next/navigation'
import { BlogProvider, useBlogContext } from '@/context/BlogContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EffectManager from '@/components/EffectManager'
import styles from './BlogLayout.module.css'

function BlogLayoutInner({ children }) {
  const pathname = usePathname()
  const { scrollTop, headerVisible, blogTheme, toggleBlogTheme, isThemeAnimating } = useBlogContext()

  // 随笔页自带页脚，不显示公共 Footer
  const isEssayDetail = pathname.startsWith('/Essay')
  // 归档页有自己的导航，不显示公共 Header
  const isArchivePage = pathname === '/TechnicalRoute'

  // 回到页面顶部
  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        {/* 非归档页显示顶部导航栏 */}
        {!isArchivePage && <Header scrollTop={scrollTop} isVisible={headerVisible} />}
        {/* 渲染子页面内容 */}
        {children}
        {/* 非随笔页显示公共页脚 */}
        {!isEssayDetail && <Footer />}
      </div>
      {/* 右下角固定工具栏 */}
      <div className={styles.Stickiness}>
        {/* 回到顶部按钮：滚动超过 700px 时显示 */}
        <li
          className={`iconfont icon-home ${styles.icon} ${scrollTop > 700 ? styles.showIcon : styles.hiddenIcon} ${styles.icon1}`}
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
