/**
 * 管理后台的客户端 Provider 组件
 * 
 * 将 next-auth 的 SessionProvider 包裹在管理后台的所有页面外层，
 * 这样管理后台中的任何客户端组件都可以使用 useSession()、signIn()、signOut() 等方法。
 * 
 * 为什么单独拆出来？
 * - SessionProvider 是客户端组件（需要 'use client'）
 * - layout.jsx 是 Server Component，不能直接使用客户端 hooks
 * - 所以用这个中间层来桥接
 */
'use client'

import { SessionProvider } from 'next-auth/react'

export default function AdminProviders({ children }) {
  return (
    <SessionProvider>{children}</SessionProvider>
  )
}
