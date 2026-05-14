/**
 * 搜索页客户端组件（Client Component）
 * 
 * 功能：
 * 1. 实时搜索：输入关键词后 300ms 防抖更新 URL
 * 2. 分页：搜索结果超过 6 条时显示分页
 * 3. 状态持久化：关键词和页码同步到 URL 参数（?keyword=xxx&page=2）
 *    - 从文章详情页返回时，浏览器历史记录保留完整 URL，状态自动恢复
 * 4. 热门标签：点击标签快速搜索
 * 
 * 为什么整个页面是客户端组件？
 * - 搜索输入框需要实时响应
 * - useSearchParams 需要客户端
 * - 分页交互需要 router.replace
 */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBlogContext } from '@/context/BlogContext'
import { allHomeArticles } from '@/data/articleMetaData'
import { getArticlePath } from '@/content/articlePath'
import styles from '@/app/(blog)/search/search.module.css'

const normalizeText = (text) => String(text || '').toLowerCase()
const PAGE_SIZE = 6

export default function SearchClient() {
  const { scrollTop = 0 } = useBlogContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  const resultShellRef = useRef(null)
  const debounceRef = useRef(null)

  // 从 URL 读取状态（单一数据源）
  const urlKeyword = searchParams.get('keyword') || ''
  const urlPage = Number(searchParams.get('page')) || 1

  // 输入框用本地 state 保持即时响应（防抖后才同步到 URL）
  const [inputValue, setInputValue] = useState(urlKeyword)

  // URL 变化时同步输入框（浏览器前进后退时触发）
  useEffect(() => {
    setInputValue(urlKeyword)
  }, [urlKeyword])

  // 同步状态到 URL（使用 replace 不产生新历史记录）
  const updateUrl = useCallback((newKeyword, newPage) => {
    const params = new URLSearchParams()
    if (newKeyword) params.set('keyword', newKeyword)
    if (newPage > 1) params.set('page', String(newPage))
    const query = params.toString()
    router.replace(`/search${query ? `?${query}` : ''}`, { scroll: false })
  }, [router])

  // 输入时防抖更新 URL（300ms）
  const handleInputChange = (value) => {
    setInputValue(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateUrl(value, 1)
    }, 300)
  }

  // 点击标签或清空时立即更新（不等防抖）
  const setKeywordImmediate = (value) => {
    setInputValue(value)
    clearTimeout(debounceRef.current)
    updateUrl(value, 1)
  }

  // 清理防抖定时器
  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  // 搜索结果：用 URL 中的 keyword 做过滤
  const trimmedKeyword = urlKeyword.trim()

  const results = useMemo(() => {
    const query = normalizeText(trimmedKeyword)
    if (!query) return allHomeArticles
    return allHomeArticles.filter((article) => {
      const searchableText = [article.title, article.meta, article.desc, ...(article.tags || [])].map(normalizeText).join(' ')
      return searchableText.includes(query)
    })
  }, [trimmedKeyword])

  // 热门标签：按使用频率排序取前 8 个
  const popularTags = useMemo(() => {
    const tagMap = new Map()
    allHomeArticles.forEach((article) => {
      article.tags?.forEach((tag) => { tagMap.set(tag, (tagMap.get(tag) || 0) + 1) })
    })
    return [...tagMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag]) => tag)
  }, [])

  // 分页计算
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const currentPage = Math.min(urlPage, pageCount)
  const pagedResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return results.slice(start, start + PAGE_SIZE)
  }, [currentPage, results])

  // 切换页码
  const changePage = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), pageCount)
    updateUrl(urlKeyword, safePage)
    window.requestAnimationFrame(() => {
      resultShellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <>
      {/* 顶部遮罩层 */}
      <div className={`${styles.headers} ${scrollTop > 270 ? styles.hiddenHeaders : ''}`}></div>
      <main className={styles.page}>
        {/* 搜索面板 */}
        <section className={styles.searchPanel}>
          <h1>搜索文章</h1>
          <p>输入关键词，快速查找标题、摘要和标签里的内容。</p>
          <label className={styles.searchBox} aria-label="搜索文章">
            <i className="iconfont icon-home1" aria-hidden="true"></i>
            <input
              type="search"
              value={inputValue}
              placeholder="搜索 JavaScript、React、CSS..."
              onChange={(e) => handleInputChange(e.target.value)}
              autoComplete="off"
            />
            {inputValue && (
              <button type="button" onClick={() => setKeywordImmediate('')} aria-label="清空搜索">清空</button>
            )}
          </label>
          {/* 热门标签快捷搜索 */}
          <div className={styles.tags} aria-label="热门标签">
            {popularTags.map((tag) => (
              <button type="button" key={tag} onClick={() => setKeywordImmediate(tag)}>{tag}</button>
            ))}
          </div>
        </section>

        {/* 搜索结果区域 */}
        <section className={styles.resultShell} ref={resultShellRef}>
          <div className={styles.resultHeader}>
            <div>
              <h2>{trimmedKeyword ? '搜索结果' : '全部文章'}</h2>
              <p>找到 <strong>{results.length}</strong> 篇文章</p>
            </div>
          </div>

          {results.length > 0 ? (
            <div className={styles.resultList}>
              {pagedResults.map((article) => (
                <Link className={styles.resultItem} href={`/articles/${getArticlePath(article.slug)}`} key={article.slug}>
                  <div className={styles.itemMeta}>{article.meta}</div>
                  <div className={styles.itemBody}>
                    <h3>{article.title}</h3>
                    <p>{article.desc}</p>
                    <div className={styles.itemTags}>
                      {article.tags?.map((tag) => (<span key={`${article.slug}-${tag}`}>{tag}</span>))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>没有找到相关文章</h3>
              <p>换一个更短的关键词试试，或者点击上方标签继续浏览。</p>
            </div>
          )}

          {/* 分页导航 */}
          {results.length > PAGE_SIZE && (
            <nav className={styles.pagination} aria-label="搜索结果分页">
              <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>上一页</button>
              {Array.from({ length: pageCount }, (_, index) => {
                const page = index + 1
                return (
                  <button
                    type="button"
                    className={currentPage === page ? styles.activePage : ''}
                    key={page}
                    onClick={() => changePage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >{page}</button>
                )
              })}
              <button type="button" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>下一页</button>
            </nav>
          )}
        </section>
      </main>
    </>
  )
}
