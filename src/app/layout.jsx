import './globals.css'
import '@/assets/iconfont/iconfont.css'

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
      <body>{children}</body>
    </html>
  )
}
