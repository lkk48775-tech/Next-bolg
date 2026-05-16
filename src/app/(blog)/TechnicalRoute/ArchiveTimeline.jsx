/**
 * 归档时间线组件（Client Component）
 * 
 * 这个组件负责：
 * 1. 从后端获取所有文章数据
 * 2. 按 created_at 的年份分组（2026、2025...）
 * 3. 渲染成时间线样式：年份标题 → 日期 + 文章名 列表
 * 4. 点击文章名跳转到详情页（链接格式：/articles/分类小写/slug）
 */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import styles from './TechnicalRoute.module.css'

export default function ArchiveTimeline() {
  const [articles, setArticles] = useState([])

  // 组件挂载时从后端获取文章列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/blog/TechnicalRoute')
        setArticles(res.data.data || [])
      } catch (err) {
        console.error('获取归档数据失败：', err)
      }
    }
    fetchData()
  }, [])

  // 把文章按年份分组
  // 比如 created_at 是 "2026-05-14"，就归到 "2026" 这一组
  const archiveGroups = useMemo(() => {
    const groups = {}
    articles.forEach((article) => {
      const date = new Date(article.created_at)
      const year = date.getFullYear().toString()
      if (!groups[year]) groups[year] = []
      groups[year].push({
        ...article,
        // 把日期格式化成 "05-14" 这样的格式显示在页面上
        dateStr: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })
    })
    return groups
  }, [articles])

  // 年份从大到小排序（最新的年份在最上面）
  const sortedYears = Object.keys(archiveGroups).sort((a, b) => Number(b) - Number(a))

  return (
    <section className={styles.archiveCard} data-archive-card>
      <header className={styles.archiveHeader}>
        <h2>文章归档</h2>
        <p>共 {articles.length} 篇文章</p>
      </header>
      <div className={styles.archiveTimeline}>
        {/* 按年份渲染每一组 */}
        {sortedYears.map((year) => (
          <section className={styles.yearGroup} key={year}>
            <h3>{year}</h3>
            <div className={styles.archiveList}>
              {/* 每篇文章显示日期和标题，点击跳转详情 */}
              {archiveGroups[year].map((article) => (
                <Link
                  className={styles.archiveEntry}
                  href={`/articles/${(article.category_name || '').toLowerCase()}/${article.slug}`}
                  key={article.id}
                >
                  <time>{article.dateStr}</time>
                  <span>{article.description || article.title}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
