/**
 * 管理后台仪表盘页面（Server Component）
 * 
 * 渲染仪表盘客户端组件，包含：
 * - 统计卡片（文章总数、分类数、标签数、专题数）
 * - 柱状图（各分类文章数量对比）
 * - 环形饼图（热门标签分布）
 * - 虚拟列表（文章列表，只渲染可见行）
 */
import AdminDashboardClient from './DashboardClient'

export default function AdminDashboard() {
  return <AdminDashboardClient />
}
