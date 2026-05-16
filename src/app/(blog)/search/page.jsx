import SearchClient from '@/components/SearchClient'
import { searchArticles } from '@/lib/searchArticles'

export default async function SearchPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const keyword = resolvedSearchParams?.keyword || ''
  const initialArticles = await searchArticles(keyword)

  return <SearchClient initialKeyword={keyword} initialArticles={initialArticles} />
}
