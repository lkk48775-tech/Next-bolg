/**
 * 管理后台仪表盘客户端组件（Client Component）
 * 
 * 从后端 API 获取数据，展示：
 * 1. 统计卡片：文章总数、分类数
 * 2. 柱状图：各分类文章数量对比
 * 3. 环形饼图：各分类文章占比
 * 4. 虚拟列表：文章列表
 */
'use client'

import { useEffect, useRef, useState } from 'react'
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
import axios from 'axios'
import styles from './dashboard.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const chartColors = [
  'rgba(56, 189, 248, .7)',
  'rgba(250, 204, 21, .7)',
  'rgba(74, 222, 128, .7)',
  'rgba(244, 114, 182, .7)',
  'rgba(192, 132, 252, .7)',
  'rgba(251, 113, 133, .7)',
  'rgba(96, 165, 250, .7)',
  'rgba(52, 211, 153, .7)',
]

const chartBorderColors = [
  'rgb(56, 189, 248)',
  'rgb(250, 204, 21)',
  'rgb(74, 222, 128)',
  'rgb(244, 114, 182)',
  'rgb(192, 132, 252)',
  'rgb(251, 113, 133)',
  'rgb(96, 165, 250)',
  'rgb(52, 211, 153)',
]

export default function AdminDashboardClient() {
  const [totalArticles, setTotalArticles] = useState(0)
  const [totalCategories, setTotalCategories] = useState(0)
  const [sections, setSections] = useState([])

  // 从后端获取专题数据，用于统计卡片和图表
  useEffect(() => {
    // 请求专题的数据
    const axiosData = async () => {
      try {
        const res = await axios.get('/api/Dashboard/sections')
        const data = res.data.data || []
        console.log(data);
        // 文章总数 = 所有专题的 article_count 之和
        const count = data.reduce((total, item) => total + item.article_count, 0)
        console.log(count);
        setTotalArticles(count)
        setTotalCategories(data.length)
        setSections(data)
      } catch (err) {
        console.error('获取仪表盘数据失败：', err)
      }
    }
    // 请求文章数据

    axiosData()
  }, [])

  // 用后端数据生成图表
  const barData = {
    labels: sections.map((s) => s.name),
    datasets: [{
      label: '文章数量',
      data: sections.map((s) => s.article_count),
      backgroundColor: chartColors.slice(0, sections.length),
      borderColor: chartBorderColors.slice(0, sections.length),
      borderWidth: 2,
      borderRadius: 8,
    }],
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

  const doughnutData = {
    labels: sections.map((s) => s.name),
    datasets: [{
      data: sections.map((s) => s.article_count),
      backgroundColor: chartColors.slice(0, sections.length),
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { padding: 16, font: { size: 13, weight: '600' }, color: '#334155' } },
      title: { display: true, text: '分类占比', font: { size: 16, weight: '700' }, color: '#1e293b' },
    },
  }

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
      </div>

      {/* 图表区域 */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartWrap}>
            {sections.length > 0 && <Bar data={barData} options={barOptions} />}
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartWrap}>
            {sections.length > 0 && <Doughnut data={doughnutData} options={doughnutOptions} />}
          </div>
        </div>
      </div>

      {/* 文章列表 - 虚拟列表 */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>文章列表 <span className={styles.tableCount}>{totalArticles} 篇</span></h2>
        <VirtualArticleList sections={sections} />
      </div>
    </div>
  )
}

// 虚拟列表：展示所有文章（从各分类的文章数据中获取）
const ROW_HEIGHT = 64
const CONTAINER_HEIGHT = 420
const OVERSCAN = 3

function VirtualArticleList({ sections }) {
  const [scrollTop, setScrollTop] = useState(0)
  const [articles, setArticles] = useState([])
  const containerRef = useRef(null)

  // 从后端获取文章列表
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get('/api/tags')
        setArticles(res.data.data || [])
      } catch (err) {
        console.error('获取文章列表失败：', err)
      }
    }
    fetchArticles()
  }, [])

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
      </div>
      <div ref={containerRef} className={styles.virtualContainer} onScroll={handleScroll}>
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleArticles.map((article, i) => {
              const index = startIndex + i
              return (
                <div className={`${styles.virtualRow} ${index % 2 === 0 ? styles.virtualRowEven : ''}`} key={article.id ?? `article-${index}`} style={{ height: ROW_HEIGHT }}>
                  <div className={styles.vrTitle}>{article.title}</div>
                  <div className={styles.vrCat}><span className={styles.badge}>{article.category}</span></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
