/**
 * 博客前台布局组件（Server Component）
 * 
 * 这是 (blog) 路由组的布局文件，所有博客前台页面（首页、文章、随笔、友链等）都使用这个布局。
 * BlogLayoutShell 是一个客户端组件，负责：
 * - 提供主题上下文（亮色/暗色切换）
 * - 渲染 Header 导航栏
 * - 渲染 Footer 页脚
 * - 渲染粒子/樱花特效
 * - 提供滚动状态给子页面
 */
import BlogLayoutShell from '@/components/BlogLayoutShell'

export default function BlogLayout({ children }) {
  return <BlogLayoutShell>{children}</BlogLayoutShell>
}
