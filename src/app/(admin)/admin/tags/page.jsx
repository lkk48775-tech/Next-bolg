/**
 * 文章管理页面（Server Component）
 * 
 * 在服务端获取用户会话（getServerSession），
 * 然后将 session 作为 prop 传给客户端组件。
 * 
 * 为什么在这里获取 session？
 * - getServerSession 是服务端 API，只能在 Server Component 中调用
 * - TagsClient 是客户端组件，不能直接调用服务端 API
 * - 通过 props 传递是 Next.js 推荐的 Server → Client 数据传递方式
 */
import { getServerSession } from "next-auth"
import TagsClient from './TagsClient'

export default async function TagsPage() {
  const session = await getServerSession()
  return <TagsClient session={session} />
}
