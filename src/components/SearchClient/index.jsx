/**
 * 搜索页组件（Client Component）
 * 
 * 整个搜索页的交互逻辑：
 * 1. 用户输入关键词 → 防抖 300ms → 请求后端搜索
 * 2. 后端返回匹配的文章（按匹配度排序）
 * 3. 前端分页展示搜索结果
 * 4. 关键词和页码同步到 URL（?keyword=xxx&page=2）
 *    这样从文章详情页返回时，搜索状态会自动恢复
 * 5. 热门标签从搜索结果中提取，点击可快速搜索
 */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HoverPrefetchLink from '@/components/HoverPrefetchLink'
import HeaderBackdrop from '@/components/HeaderBackdrop'
import axios from 'axios'
import styles from '@/app/(blog)/search/search.module.css'

// 每页显示几条结果
const PAGE_SIZE = 6

export default function SearchClient({ initialKeyword = '', initialArticles = [] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resultShellRef = useRef(null)
  const debounceRef = useRef(null)

  // 从 URL 读取当前的搜索状态
  const urlKeyword = searchParams.get('keyword') || ''
  const urlPage = Number(searchParams.get('page')) || 1

  // 输入框的值（本地 state，打字时立即响应，不等防抖）
  const [inputValue, setInputValue] = useState(initialKeyword || urlKeyword)
  // 搜索结果（从后端获取）
  const [articles, setArticles] = useState(initialArticles)
  // 加载状态
  const [loading, setLoading] = useState(false)

  // 浏览器前进/后退时，URL 变了，同步更新输入框
  useEffect(() => {
    setInputValue(urlKeyword)
  }, [urlKeyword])

  useEffect(() => {
    setArticles(initialArticles)
  }, [initialArticles])

  // URL 中的 keyword 变化时，请求后端搜索
  useEffect(() => {
    if (urlKeyword === initialKeyword) return

    const fetchResults = async () => {
      setLoading(true)
      try {
        const res = await axios.get('/api/blog/search', {
          params: { keyword: urlKeyword }
        })
        setArticles(res.data.data || [])
      } catch (err) {
        console.error('搜索失败：', err)
        setArticles([])
      }
      setLoading(false)
    }
    fetchResults()
  }, [initialKeyword, urlKeyword])

  // 更新 URL 参数（用 replace 不产生新的浏览器历史记录）
  const updateUrl = useCallback((newKeyword, newPage) => {
    const params = new URLSearchParams()
    if (newKeyword) params.set('keyword', newKeyword)
    if (newPage > 1) params.set('page', String(newPage))
    const query = params.toString()
    router.replace(`/search${query ? `?${query}` : ''}`, { scroll: false })
  }, [router])

  // 用户打字时：立即更新输入框，300ms 后才更新 URL（触发搜索）
  // 这样打字不会卡，但也不会每打一个字就请求一次后端
  const handleInputChange = (value) => {
    setInputValue(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateUrl(value, 1)
    }, 300)
  }

  // 点击标签或清空按钮时：立即更新，不等防抖
  const setKeywordImmediate = (value) => {
    setInputValue(value)
    clearTimeout(debounceRef.current)
    updateUrl(value, 1)
  }

  // 组件卸载时清理防抖定时器
  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  // 从搜索结果中提取热门标签（出现次数最多的前 8 个）
  const popularTags = useMemo(() => {
    const tagMap = new Map()
    articles.forEach((article) => {
      try {
        const tags = JSON.parse(article.tech_stack || '[]')
        tags.forEach((tag) => { tagMap.set(tag, (tagMap.get(tag) || 0) + 1) })
      } catch {}
    })
    return [...tagMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag]) => tag)
  }, [articles])

  // 分页计算
  const pageCount = Math.max(1, Math.ceil(articles.length / PAGE_SIZE))
  const currentPage = Math.min(urlPage, pageCount)
  const pagedResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return articles.slice(start, start + PAGE_SIZE)
  }, [currentPage, articles])

  // 切换页码
  const changePage = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), pageCount)
    updateUrl(urlKeyword, safePage)
    // 翻页后滚动到结果区域顶部
    window.requestAnimationFrame(() => {
      resultShellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const trimmedKeyword = urlKeyword.trim()

  return (
    <>
      {/* 顶部遮罩条 */}
      <HeaderBackdrop />
      <main className={styles.page}>
        {/* 搜索面板：标题 + 输入框 + 热门标签 */}
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
          {/* 热门标签：点击直接搜索 */}
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
              <p>找到 <strong>{articles.length}</strong> 篇文章</p>
            </div>
          </div>

          {/* 三种状态：加载中 / 有结果 / 无结果 */}
          {loading ? (
            <div className={styles.emptyState}><h3>搜索中...</h3></div>
          ) : articles.length > 0 ? (
            <div className={styles.resultList}>
              {pagedResults.map((article) => {
                // 解析技术标签（数据库存的是 JSON 字符串）
                const tags = (() => { try { return JSON.parse(article.tech_stack || '[]') } catch { return [] } })()
                return (
                  <HoverPrefetchLink
                    className={styles.resultItem}
                    href={`/articles/${(article.category_name || '').toLowerCase()}/${article.slug}`}
                    key={article.id}
                  >
                    <div className={styles.itemMeta}>{article.title}</div>
                    <div className={styles.itemBody}>
                      <h3>{article.description || article.title}</h3>
                      <p>{article.summary}</p>
                      <div className={styles.itemTags}>
                        {tags.map((tag) => (<span key={`${article.id}-${tag}`}>{tag}</span>))}
                      </div>
                    </div>
                  </HoverPrefetchLink>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>没有找到相关文章</h3>
              <p>换一个更短的关键词试试，或者点击上方标签继续浏览。</p>
            </div>
          )}

          {/* 分页按钮 */}
          {articles.length > PAGE_SIZE && (
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
