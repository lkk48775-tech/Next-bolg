'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './tags.module.css'
import axios from 'axios'

const ROW_HEIGHT = 68
const CONTAINER_HEIGHT = 440
const OVERSCAN = 3

export default function TagsClient() {
  const [articles, setArticles] = useState([])
  const [sections, setSections] = useState([])
  const [filter, setFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filteredArticles = useMemo(() => {
    if (!filter) return articles
    const q = filter.toLowerCase()
    return articles.filter((a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
  }, [articles, filter])

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get('/api/tags')
        setArticles(res.data.data || [])
      } catch (err) {
        console.error('请求文章失败：', err)
      }
    }

    const fetchSections = async () => {
      try {
        const res = await axios.get('/api/sections')
        const names = (res.data.data || []).map((item) => item.name)
        setSections(names)
      } catch (err) {
        console.error('请求专题失败：', err)
        setSections([])
      }
    }

    fetchArticles()
    fetchSections()
  }, [])

  const handleAddArticle = async (articleData) => {
    if (articles.some((a) => a.title === articleData.name)) {
      alert('文章已存在')
      return
    }

    setArticles([
      {
        slug: articleData.name,
        title: articleData.name,
        meta: articleData.alias,
        desc: articleData.summary,
        tags: articleData.techStacks,
        category: articleData.section
      },
      ...articles
    ])

    const res = await axios.post('/api/tags', {
      name: articleData.name,
      alias: articleData.alias,
      summary: articleData.summary,
      detail: articleData.detail,
      section: articleData.section,
      techStacks: articleData.techStacks,
      slug: articleData.slug
    })
    console.log('数据库写入：', res.data)

    if (articleData.detail) {
      try {
        const mdxRes = await axios.post('/api/blog/createArticle', {
          slug: articleData.slug || articleData.name,
          category: articleData.section,
          content: articleData.detail
        })
        console.log('MDX 文件创建：', mdxRes.data)
      } catch (err) {
        console.error('创建 MDX 文件失败：', err)
      }
    }

    setDrawerOpen(false)
  }

  const handleDelete = (title) => {
    setDeleteTarget(title)
  }

  const confirmDelete = async () => {
    setArticles(articles.filter((a) => a.title !== deleteTarget))
    setDeleteTarget(null)
    axios.delete('/api/tags', {
      params: {
        name: deleteTarget
      }
    })
  }

  const cancelDelete = () => {
    setDeleteTarget(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>文章管理</h1>
        <p className={styles.desc}>管理博客文章，查看使用频率，添加或删除文章。</p>
      </div>

      <div className={styles.toolbar}>
        <button className={styles.addBtn} onClick={() => setDrawerOpen(true)}>
          + 添加文章
        </button>
        <div className={styles.searchBar}>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="搜索文章..."
            className={styles.filterInput}
          />
        </div>
      </div>

      <div className={styles.summary}>
        共 <strong>{articles.length}</strong> 篇文章
        {filter && <span>，筛选出 <strong>{filteredArticles.length}</strong> 篇</span>}
      </div>

      <VirtualArticleList articles={filteredArticles} onDelete={handleDelete} />

      {filteredArticles.length === 0 && (
        <div className={styles.empty}>
          {filter ? '没有匹配的文章' : '暂无文章，点击上方添加。'}
        </div>
      )}

      <AddTagDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSubmit={handleAddArticle} sections={sections} />

      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>!</div>
            <h3 className={styles.modalTitle}>确认删除</h3>
            <p className={styles.modalDesc}>
              确定要删除文章 <strong>{deleteTarget}</strong> 吗？此操作不可撤销。
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={cancelDelete}>取消</button>
              <button className={styles.modalConfirm} onClick={confirmDelete}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AddTagDrawer({ open, onClose, onSubmit, sections }) {
  const [form, setForm] = useState({ name: '', techName: '', alias: '', summary: '', detail: '', section: '' })
  const [techStacks, setTechStacks] = useState([])
  const [techInput, setTechInput] = useState('')

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setForm({ name: '', techName: '', alias: '', summary: '', detail: '', section: '' })
      setTechStacks([])
      setTechInput('')
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
  }

  const addTech = () => {
    const value = techInput.trim()
    if (!value || techStacks.includes(value)) return
    setTechStacks([...techStacks, value])
    setTechInput('')
  }

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTech()
    }
  }

  const removeTech = (tech) => {
    setTechStacks(techStacks.filter((t) => t !== tech))
  }

  const isFormValid = form.name.trim() && form.techName.trim() && form.section && form.alias.trim() && form.summary.trim() && form.detail.trim() && techStacks.length > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFormValid) return
    onSubmit({
      name: form.name.trim(),
      techName: form.techName.trim(),
      alias: form.alias.trim(),
      summary: form.summary.trim(),
      detail: form.detail.trim(),
      section: form.section,
      techStacks,
      slug: form.techName.trim()
    })
  }

  return (
    <>
      <div className={`${styles.drawerOverlay} ${open ? styles.drawerOverlayVisible : ''}`} onClick={onClose} />
      <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <h2>添加文章</h2>
          <button className={styles.drawerClose} onClick={onClose} aria-label="关闭">x</button>
        </div>
        <form className={styles.drawerForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>文章标题 <span>*</span></label>
            <input type="text" value={form.name} onChange={handleChange('name')} placeholder="例如：React Hooks 入门" />
          </div>
          <div className={styles.formGroup}>
            <label>技术名 <span>*</span></label>
            <input type="text" value={form.techName} onChange={handleChange('techName')} placeholder="例如：hooks" />
          </div>
          <div className={styles.formGroup}>
            <label>所属专题 <span>*</span></label>
            <select value={form.section} onChange={handleChange('section')} className={styles.select}>
              <option value="" disabled>请选择专题</option>
              {sections.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>文章别名</label>
            <input type="text" value={form.alias} onChange={handleChange('alias')} placeholder="例如：react-hooks" />
          </div>
          <div className={styles.formGroup}>
            <label>简单介绍</label>
            <textarea value={form.summary} onChange={handleChange('summary')} placeholder="一两句话概括文章内容..." rows={3} />
          </div>
          <div className={styles.formGroup}>
            <label>详细介绍</label>
            <textarea value={form.detail} onChange={handleChange('detail')} placeholder="更详细地描述文章涉及的知识点、使用场景..." rows={5} />
          </div>
          <div className={styles.formGroup}>
            <label>使用的技术栈</label>
            <div className={styles.techInputRow}>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="输入后按回车或点击添加"
              />
              <button type="button" className={styles.techAddBtn} onClick={addTech} disabled={!techInput.trim()}>
                添加
              </button>
            </div>
            {techStacks.length > 0 && (
              <div className={styles.techList}>
                {techStacks.map((tech) => (
                  <span className={styles.techItem} key={tech}>
                    {tech}
                    <button type="button" onClick={() => removeTech(tech)} aria-label={`移除 ${tech}`}>x</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className={styles.drawerActions}>
            <button type="button" className={styles.drawerCancelBtn} onClick={onClose}>取消</button>
            <button type="submit" className={styles.drawerSubmitBtn} disabled={!isFormValid}>确认添加</button>
          </div>
        </form>
      </aside>
    </>
  )
}

function VirtualArticleList({ articles, onDelete }) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = articles.length * ROW_HEIGHT
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(articles.length, Math.ceil((scrollTop + CONTAINER_HEIGHT) / ROW_HEIGHT) + OVERSCAN)
  const visibleArticles = articles.slice(startIndex, endIndex)
  const offsetY = startIndex * ROW_HEIGHT

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, [])

  return (
    <div ref={containerRef} className={styles.virtualContainer} onScroll={handleScroll}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleArticles.map((article, i) => {
            const index = startIndex + i
            return (
              <div className={`${styles.tagRow} ${index % 2 === 0 ? styles.tagRowEven : ''}`} key={article.id ?? `article-${index}`} style={{ height: ROW_HEIGHT }}>
                <div className={styles.tagInfo}>
                  <span className={styles.tagName}>{article.title}</span>
                  <span className={styles.tagCount}>{article.category}</span>
                </div>
                <button className={styles.deleteBtn} onClick={() => onDelete(article.title)} aria-label={`删除 ${article.title}`}>x</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
