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

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import styles from '@/app/(blog)/Essay/essay.module.css'

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.code !== 200) {
    const error = new Error(payload.msg || '请求失败')
    error.status = response.status
    throw error
  }

  return payload
}

export default function EssayActions({ title, desc, articleId = null, likeCount = 0, liked = false }) {
  const { status } = useSession()
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount)
  const [currentLiked, setCurrentLiked] = useState(liked)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setCurrentLikeCount(likeCount)
    setCurrentLiked(liked)
  }, [likeCount, liked])

  const loginWithGithub = async () => {
    const callbackUrl = typeof window === 'undefined' ? '/' : window.location.href
    await signIn('github', { callbackUrl })
  }

  const handleLike = async () => {
    if (!articleId) return

    if (status !== 'authenticated') {
      await loginWithGithub()
      return
    }

    setPending(true)

    try {
      const payload = await fetchJson(`/api/blog/articles/${articleId}/like`, {
        method: 'POST',
      })

      setCurrentLikeCount(payload.data.likeCount)
      setCurrentLiked(Boolean(payload.data.liked))
    } catch (error) {
      if (error.status === 401) {
        await loginWithGithub()
      }
    } finally {
      setPending(false)
    }
  }

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
      <button
        className={currentLiked ? styles.likedAction : ''}
        type="button"
        disabled={pending}
        onClick={articleId ? handleLike : undefined}
      >
        <span>{currentLiked ? '已喜欢' : '点赞'}{articleId ? ` ${currentLikeCount}` : ''}</span>
      </button>
      <button type="button"><span>收藏</span></button>
      <button type="button" onClick={handleShare}><span>分享</span></button>
    </div>
  )
}
