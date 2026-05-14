/**
 * 认证页面布局（Server Component）
 * 
 * (auth) 路由组的布局，用于登录页等认证相关页面。
 * 不包含任何导航栏、侧边栏或页脚，只渲染子页面内容。
 * 这样登录页可以是一个干净的全屏页面。
 */
export default function AuthLayout({ children }) {
  return <>{children}</>
}
