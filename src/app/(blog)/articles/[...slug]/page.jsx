/**
 * 文章详情页（Server Component）
 * 
 * 渲染文章详情的客户端组件 ArticleDetailClient。
 * 使用 [...slug] 动态路由捕获多级路径（如 /articles/css/css-flex）。
 * 
 * 为什么整个详情页是客户端组件？
 * - 需要动态加载 MDX 文件（import()）
 * - 需要 IntersectionObserver 实现目录高亮
 * - 需要打字机效果动画
 * - 需要主题切换交互
 */
import ArticleDetailClient from './ArticleDetailClient'

export default function ArticleDetailPage() {
  return <ArticleDetailClient />
}