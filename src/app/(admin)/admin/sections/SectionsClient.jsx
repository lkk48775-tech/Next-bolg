/**
 * 专题管理客户端组件（Client Component）
 * 
 * 功能：
 * 1. 显示所有专题列表（从后端 API 获取）
 * 2. 添加新专题
 * 3. 删除专题（弹出确认弹框，根据 name 值筛选删除）
 */
'use client'

import { useState, useEffect } from 'react'
import styles from './sections.module.css'
import axios from 'axios'

export default function SectionsClient() {
  const [sections, setSections] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [deleteIndex, setDeleteIndex] = useState(null)

  // 组件挂载时从后端获取专题列表
  useEffect(() => {
    const load = async () => {
      const names = await fetchData()
      setSections(names || [])
    }
    load()
  }, [])

  // 获取专题列表
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/sections')
      const resData = response.data
      const categories = resData.data
      const names = categories.map((item) => item.name)
      return names
    } catch (err) {
      console.error('加载失败：', err)
      return []
    }
  }

  // 添加专题
  const handleAdd = async (e) => {
    e.preventDefault()
    const name = inputValue.trim()
    if (!name || sections.includes(name)) {
      alert('专题名称不能为空或已存在！')
      return
    }
    setSections([...sections, name])
    setInputValue('')
    await axios.post('/api/sections', { name, acarticle_count: 0 })
  }

  // 点击删除按钮，记录要删除的专题名称
  const handleDelete = (name) => {
    setDeleteIndex(name)
  }

  // 确认删除：根据 name 值筛选掉对应专题
  const confirmDelete = () => {
    setSections(sections.filter((s) => s !== deleteIndex))
    axios.delete('/api/sections', { params: { name: deleteIndex } })
    setDeleteIndex(null)
  }

  const cancelDelete = () => {
    setDeleteIndex(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>专题管理</h1>
        <p className={styles.desc}>管理博客的文章专题分类，可以添加或删除。</p>
      </div>

      <form className={styles.addForm} onSubmit={handleAdd}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入新专题名称..."
          className={styles.input}
        />
        <button type="submit" className={styles.addBtn} disabled={!inputValue.trim()}>
          添加专题
        </button>
      </form>

      <div className={styles.list}>
        {sections.map((section, index) => (
          <div className={styles.item} key={`${section}-${index}`}>
            <div className={styles.itemInfo}>
              <span className={styles.itemIndex}>{index + 1}</span>
              <span className={styles.itemName}>{section}</span>
            </div>
            <div className={styles.itemActions}>
              <button className={styles.deleteBtn} onClick={() => handleDelete(section)}>删除</button>
            </div>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className={styles.empty}>暂无专题，点击上方添加。</div>
      )}

      {/* 删除确认弹框 */}
      {deleteIndex !== null && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>⚠</div>
            <h3 className={styles.modalTitle}>确认删除</h3>
            <p className={styles.modalDesc}>
              确定要删除专题 <strong>「{deleteIndex}」</strong> 吗？此操作不可撤销。
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
