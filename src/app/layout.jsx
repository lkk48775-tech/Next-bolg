/**
 * 根布局组件（Server Component）
 * 
 * 这是整个应用最外层的布局，所有路由组（blog、admin、auth）都共享这个布局。
 * 只负责：
 * 1. 设置 HTML 结构（html + body）
 * 2. 引入全局样式（globals.css + iconfont）
 * 3. 设置页面元数据（标题、描述、图标）
 * 
 * 注意：不包含任何业务布局（Header/Footer/侧边栏），
 * 这些由各路由组自己的 layout.jsx 负责。
 */
import './globals.css'
import '@/assets/iconfont/iconfont.css'
import Providers from "./providers"
export const metadata = {
  title: 'my-react-blog',
  description: '个人博客 - 记录前端、算法和项目实践',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
        {children}
          </Providers>
        </body>
    </html>
  )
}
