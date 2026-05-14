/**
 * 搜索页面（Server Component）
 * 
 * 用 Suspense 包裹 SearchClient 客户端组件。
 * Suspense 是必须的，因为 SearchClient 内部使用了 useSearchParams()，
 * Next.js 15 要求使用 useSearchParams 的组件必须在 Suspense 边界内。
 */
import { Suspense } from 'react'
import SearchClient from '@/components/SearchClient'

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchClient />
    </Suspense>
  )
}
