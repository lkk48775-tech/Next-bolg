/**
 * 管理后台仪表盘客户端组件（Client Component）
 * 
 * 使用 react-chartjs-2 + chart.js 展示数据可视化：
 * 1. 统计卡片：文章总数、分类数、标签数、专题数
 * 2. 柱状图：各分类（CSS/JS/Vue/React/Browser）的文章数量对比
 * 3. 环形饼图：热门标签的使用频率分布
 * 4. 虚拟列表：文章列表（只渲染可见行，容器高度 420px，每行 64px）
 * 
 * 为什么是客户端组件？
 * - chart.js 需要 Canvas API（浏览器环境）
 * - 虚拟列表需要监听 scroll 事件
 */
'use client'

import { useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { allHomeArticles, techSections } from '@/data/articleMetaData'
import styles from './dashboard.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

// 按分类统计文章数量
const categoryCount = {}
allHomeArticles.forEach((article) => {
  let cat = 'Other'
  if (article.slug.startsWith('css-')) cat = 'CSS'
  else if (article.slug.startsWith('js-')) cat = 'JavaScript'
  else if (article.slug.startsWith('vue-')) cat = 'Vue'
  else if (article.slug.startsWith('react-') || article.slug === 'dynamic-breadcrumb' || article.slug === 'virtual-list') cat = 'React'
  else if (article.slug === 'file-md5' || article.slug === 'large-file-upload') cat = 'Browser'
  categoryCount[cat] = (categoryCount[cat] || 0) + 1
})

// 按标签统计
const tagCount = {}
allHomeArticles.forEach((article) => {
  article.tags?.forEach((tag) => {
    tagCount[tag] = (tagCount[tag] || 0) + 1
  })
})
const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 8)

// 柱状图数据
const barData = {
  labels: Object.keys(categoryCount),
  datasets: [
    {
      label: '文章数量',
      data: Object.values(categoryCount),
      backgroundColor: [
        'rgba(56, 189, 248, .7)',
        'rgba(250, 204, 21, .7)',
        'rgba(74, 222, 128, .7)',
        'rgba(244, 114, 182, .7)',
        'rgba(192, 132, 252, .7)',
      ],
      borderColor: [
        'rgb(56, 189, 248)',
        'rgb(250, 204, 21)',
        'rgb(74, 222, 128)',
        'rgb(244, 114, 182)',
        'rgb(192, 132, 252)',
      ],
      borderWidth: 2,
      borderRadius: 8,
    },
  ],
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: '各分类文章数量', font: { size: 16, weight: '700' }, color: '#1e293b' },
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#64748b' }, grid: { color: 'rgba(148,163,184,.15)' } },
    x: { ticks: { color: '#334155', font: { weight: '600' } }, grid: { display: false } },
  },
}

// 饼图数据
const doughnutColors = [
  'rgba(244, 114, 182, .8)',
  'rgba(56, 189, 248, .8)',
  'rgba(250, 204, 21, .8)',
  'rgba(74, 222, 128, .8)',
  'rgba(192, 132, 252, .8)',
  'rgba(251, 113, 133, .8)',
  'rgba(96, 165, 250, .8)',
  'rgba(52, 211, 153, .8)',
]

const doughnutData = {
  labels: topTags.map(([tag]) => tag),
  datasets: [
    {
      data: topTags.map(([, count]) => count),
      backgroundColor: doughnutColors,
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { padding: 16, font: { size: 13, weight: '600' }, color: '#334155' } },
    title: { display: true, text: '热门标签分布', font: { size: 16, weight: '700' }, color: '#1e293b' },
  },
}

export default function AdminDashboardClient() {
  const totalArticles = allHomeArticles.length
  const totalCategories = Object.keys(categoryCount).length
  const totalTags = Object.keys(tagCount).length
  const totalSections = techSections.length

  return (
    <div className={styles.dashboard}>

      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalArticles}</span>
          <span className={styles.statLabel}>文章总数</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalCategories}</span>
          <span className={styles.statLabel}>分类数</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalTags}</span>
          <span className={styles.statLabel}>标签数</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalSections}</span>
          <span className={styles.statLabel}>专题数</span>
        </div>
      </div>

      {/* 图表区域 */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartWrap}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartWrap}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* 文章列表 - 虚拟列表 */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>文章列表 <span className={styles.tableCount}>{allHomeArticles.length} 篇</span></h2>
        <VirtualArticleList articles={allHomeArticles} />
      </div>
    </div>
  )
}

// 虚拟列表组件
const ROW_HEIGHT = 64
const CONTAINER_HEIGHT = 420
const OVERSCAN = 3

function getCategory(slug) {
  if (slug.startsWith('css-')) return 'CSS'
  if (slug.startsWith('js-')) return 'JavaScript'
  if (slug.startsWith('vue-')) return 'Vue'
  if (slug.startsWith('react-') || slug === 'dynamic-breadcrumb' || slug === 'virtual-list') return 'React'
  if (slug === 'file-md5' || slug === 'large-file-upload') return 'Browser'
  return 'Other'
}

function VirtualArticleList({ articles }) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef(null)

  const totalHeight = articles.length * ROW_HEIGHT
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(articles.length, Math.ceil((scrollTop + CONTAINER_HEIGHT) / ROW_HEIGHT) + OVERSCAN)
  const visibleArticles = articles.slice(startIndex, endIndex)
  const offsetY = startIndex * ROW_HEIGHT

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }

  return (
    <>
      <div className={styles.virtualHeader}>
        <span className={styles.vhTitle}>标题</span>
        <span className={styles.vhCat}>分类</span>
        <span className={styles.vhTags}>标签</span>
      </div>
      <div
        ref={containerRef}
        className={styles.virtualContainer}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleArticles.map((article, i) => {
              const cat = getCategory(article.slug)
              const index = startIndex + i
              return (
                <div
                  className={`${styles.virtualRow} ${index % 2 === 0 ? styles.virtualRowEven : ''}`}
                  key={article.slug}
                  style={{ height: ROW_HEIGHT }}
                >
                  <div className={styles.vrTitle}>{article.title}</div>
                  <div className={styles.vrCat}><span className={styles.badge}>{cat}</span></div>
                  <div className={styles.vrTags}>
                    {article.tags?.map((tag) => (
                      <span className={styles.tag} key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
