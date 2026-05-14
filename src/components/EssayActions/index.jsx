/**
 * 随笔操作按钮组件（Client Component）
 * 
 * 从随笔页 Server Component 中拆出来的交互部分。
 * 只有"分享"按钮需要调用浏览器 API（navigator.share / navigator.clipboard），
 * 所以单独作为客户端组件。
 * 
 * Props:
 * - title: 随笔标题（用于分享数据）
 * - desc: 随笔描述（用于分享数据）
 */
'use client'

import styles from '@/app/(blog)/Essay/essay.module.css'

export default function EssayActions({ title, desc }) {
  // 分享功能：优先使用系统分享 API，不支持时复制链接到剪贴板
  const handleShare = async () => {
    const shareData = { title, text: desc, url: window.location.href }

    if (navigator.share) {
      await navigator.share(shareData)
      return
    }

    await navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className={styles.actions}>
      <button type="button"><span>点赞</span></button>
      <button type="button"><span>收藏</span></button>
      <button type="button" onClick={handleShare}><span>分享</span></button>
    </div>
  )
}
