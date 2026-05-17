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

function ShareButton({ title, desc }) {
  const handleShare = async () => {
    const shareData = { title, text: desc, url: window.location.href }

    if (navigator.share) {
      await navigator.share(shareData)
      return
    }

    await navigator.clipboard.writeText(window.location.href)
  }

  return (
    <button type="button" onClick={handleShare}>
      <span>分享</span>
    </button>
  )
}

function ShareOnlyActions({ title, desc }) {
  return (
    <div className={styles.actions}>
      <button type="button"><span>点赞</span></button>
      <button type="button"><span>收藏</span></button>
      <ShareButton title={title} desc={desc} />
    </div>
  )
}

function ArticleActions({ title, desc, articleId, likeCount, liked }) {
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

  return (
    <div className={styles.actions}>
      <button
        className={currentLiked ? styles.likedAction : ''}
        type="button"
        disabled={pending}
        onClick={handleLike}
      >
        <span>{currentLiked ? '已喜欢' : '点赞'} {currentLikeCount}</span>
      </button>
      <button type="button"><span>收藏</span></button>
      <ShareButton title={title} desc={desc} />
    </div>
  )
}

export default function EssayActions({ title, desc, articleId = null, likeCount = 0, liked = false }) {
  if (!articleId) {
    return <ShareOnlyActions title={title} desc={desc} />
  }

  return (
    <ArticleActions
      title={title}
      desc={desc}
      articleId={articleId}
      likeCount={likeCount}
      liked={liked}
    />
  )
}
