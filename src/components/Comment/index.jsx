'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import styles from './Comment.module.css'

const COMMENT_USER_CACHE_KEY = 'comment-user-cache'
const COMMENT_LIKED_STORAGE_PREFIX = 'comment-liked:'

const normalizeComments = (comments = []) =>
  comments.map((comment) => ({
    ...comment,
    avatarTone: comment.avatarTone || 'guest',
    likeCount: comment.likeCount || 0,
    liked: Boolean(comment.liked),
    replyCount: comment.replyCount || 0,
    replies: Array.isArray(comment.replies)
      ? comment.replies.map((reply) => ({
          ...reply,
          avatarTone: reply.avatarTone || 'guest',
          likeCount: reply.likeCount || 0,
          liked: Boolean(reply.liked),
        }))
      : [],
  }))

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.code !== 200) {
    const error = new Error(payload.msg || '请求失败')
    error.status = response.status
    throw error
  }

  return payload
}

const fetchCommentsByArticleId = async (articleId) => {
  const payload = await fetchJson(`/api/blog/comments?articleId=${articleId}`)
  return normalizeComments(payload.data)
}

const buildUserSummary = (user) => {
  if (!user?.id) return null

  return {
    id: user.id,
    githubId: user.githubId || null,
    username: user.username || user.name || '',
    name: user.name || user.username || '',
    image: user.image || null,
  }
}

const readLocalUser = () => {
  if (typeof window === 'undefined') return null

  try {
    const rawValue = window.localStorage.getItem(COMMENT_USER_CACHE_KEY)
    return rawValue ? JSON.parse(rawValue) : null
  } catch {
    return null
  }
}

const persistLocalUser = (user) => {
  if (typeof window === 'undefined') return

  if (!user) {
    window.localStorage.removeItem(COMMENT_USER_CACHE_KEY)
    return
  }

  window.localStorage.setItem(COMMENT_USER_CACHE_KEY, JSON.stringify(user))
}

const getLikedStorageKey = (userId) => `${COMMENT_LIKED_STORAGE_PREFIX}${userId}`

const readLikedCommentMap = (userId) => {
  if (typeof window === 'undefined' || !userId) return {}

  try {
    const rawValue = window.localStorage.getItem(getLikedStorageKey(userId))
    return rawValue ? JSON.parse(rawValue) : {}
  } catch {
    return {}
  }
}

const persistLikedCommentMap = (userId, likedCommentMap) => {
  if (typeof window === 'undefined' || !userId) return
  window.localStorage.setItem(getLikedStorageKey(userId), JSON.stringify(likedCommentMap))
}

const buildLikedCommentMap = (comments) => {
  const nextLikedCommentMap = {}

  comments.forEach((comment) => {
    if (comment.liked) {
      nextLikedCommentMap[comment.id] = true
    }

    comment.replies.forEach((reply) => {
      if (reply.liked) {
        nextLikedCommentMap[reply.id] = true
      }
    })
  })

  return nextLikedCommentMap
}

const updateCommentLikeState = (comments, targetId, likeCount, liked) =>
  comments.map((comment) => {
    if (comment.id === targetId) {
      return { ...comment, likeCount, liked }
    }

    return {
      ...comment,
      replies: comment.replies.map((reply) =>
        reply.id === targetId ? { ...reply, likeCount, liked } : reply
      ),
    }
  })

function Comment({ className = '', articleId, title = '' }) {
  const { data: session, status } = useSession()
  const [cachedUser, setCachedUser] = useState(null)
  const [likedCommentMap, setLikedCommentMap] = useState({})
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [activeReply, setActiveReply] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [expandedReplies, setExpandedReplies] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitPending, setSubmitPending] = useState(false)
  const [replyPending, setReplyPending] = useState(false)
  const [likePendingMap, setLikePendingMap] = useState({})
  const [actionMessage, setActionMessage] = useState('')

  const currentUser = useMemo(() => {
    if (status === 'authenticated') {
      return buildUserSummary(session?.user)
    }

    if (status === 'loading') {
      return cachedUser
    }

    return null
  }, [cachedUser, session?.user, status])

  const currentUserId = currentUser?.id || null
  const commentTotal = useMemo(
    () => comments.length + comments.reduce((sum, comment) => sum + comment.replies.length, 0),
    [comments]
  )

  const articleLabel = title ? `《${title}》` : '这篇文章'

  useEffect(() => {
    setCachedUser(readLocalUser())
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      const nextUser = buildUserSummary(session?.user)
      setCachedUser(nextUser)
      persistLocalUser(nextUser)
      return
    }

    if (status === 'unauthenticated') {
      setCachedUser(null)
      persistLocalUser(null)
      setLikedCommentMap({})
    }
  }, [session?.user, status])

  useEffect(() => {
    if (!currentUserId) {
      setLikedCommentMap({})
      return
    }

    setLikedCommentMap(readLikedCommentMap(currentUserId))
  }, [currentUserId])

  useEffect(() => {
    if (!actionMessage) return undefined

    const timer = window.setTimeout(() => setActionMessage(''), 3200)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

  const clearLocalAuthCache = useCallback(() => {
    setCachedUser(null)
    persistLocalUser(null)
    setLikedCommentMap({})
  }, [])

  const refreshComments = useCallback(
    async ({ quiet = false } = {}) => {
      if (!articleId) {
        setComments([])
        setLoadError('缺少文章 ID，评论功能暂时不可用。')
        setLoading(false)
        return
      }

      if (!quiet) {
        setLoading(true)
      }

      setLoadError('')

      try {
        const nextComments = await fetchCommentsByArticleId(articleId)
        setComments(nextComments)
        setLikedCommentMap(buildLikedCommentMap(nextComments))
        setExpandedReplies((prevExpandedReplies) => {
          const nextExpandedReplies = {}

          nextComments.forEach((comment) => {
            nextExpandedReplies[comment.id] = prevExpandedReplies[comment.id] || false
          })

          return nextExpandedReplies
        })
      } catch (error) {
        setLoadError(error.message || '加载评论失败，请稍后再试。')
      } finally {
        if (!quiet) {
          setLoading(false)
        }
      }
    },
    [articleId]
  )

  useEffect(() => {
    void refreshComments()
  }, [refreshComments])

  const loginWithGithub = useCallback(async () => {
    const callbackUrl = typeof window === 'undefined' ? '/' : window.location.href
    await signIn('github', { callbackUrl })
  }, [])

  const ensureAuthenticated = useCallback(
    async (actionName) => {
      if (status === 'authenticated') {
        return true
      }

      if (status === 'loading') {
        if (currentUser) {
          return true
        }

        setActionMessage('正在确认登录状态，请稍后再试。')
        return false
      }

      setActionMessage(`请先通过 GitHub 登录后再${actionName}。`)
      await loginWithGithub()
      return false
    },
    [currentUser, loginWithGithub, status]
  )

  const openReply = async (commentId, targetName, replyId = null) => {
    if (!(await ensureAuthenticated('回复'))) return

    if (
      activeReply?.commentId === commentId &&
      activeReply?.targetName === targetName &&
      activeReply?.replyId === replyId
    ) {
      setActiveReply(null)
      setReplyContent('')
      return
    }

    setExpandedReplies((prevExpandedReplies) => ({
      ...prevExpandedReplies,
      [commentId]: true,
    }))
    setActiveReply({ commentId, targetName, replyId })
    setReplyContent('')
  }

  const toggleReplies = (commentId) => {
    if (expandedReplies[commentId] && activeReply?.commentId === commentId && activeReply.replyId !== null) {
      setActiveReply(null)
    }

    setExpandedReplies((prevExpandedReplies) => ({
      ...prevExpandedReplies,
      [commentId]: !prevExpandedReplies[commentId],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!(await ensureAuthenticated('评论'))) return

    const nextContent = content.trim()

    if (!nextContent) {
      setActionMessage('评论内容不能为空。')
      return
    }

    setSubmitPending(true)

    try {
      await fetchJson('/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          content: nextContent,
        }),
      })

      setContent('')
      setActionMessage('评论发布成功。')
      await refreshComments({ quiet: true })
    } catch (error) {
      if (error.status === 401) {
        clearLocalAuthCache()
        setActionMessage('登录状态已失效，正在跳转 GitHub 重新登录。')
        await loginWithGithub()
        return
      }

      setActionMessage(error.message || '评论发布失败，请稍后再试。')
    } finally {
      setSubmitPending(false)
    }
  }

  const handleReplySubmit = async (event, commentId) => {
    event.preventDefault()
    const nextContent = replyContent.trim()

    if (!nextContent || !activeReply) {
      setActionMessage('回复内容不能为空。')
      return
    }

    if (!(await ensureAuthenticated('回复'))) return

    const parentId = activeReply.replyId || commentId
    setReplyPending(true)

    try {
      await fetchJson('/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          parentId,
          content: nextContent,
        }),
      })

      setExpandedReplies((prevExpandedReplies) => ({
        ...prevExpandedReplies,
        [commentId]: true,
      }))
      setActiveReply(null)
      setReplyContent('')
      setActionMessage('回复发布成功。')
      await refreshComments({ quiet: true })
    } catch (error) {
      if (error.status === 401) {
        clearLocalAuthCache()
        setActionMessage('登录状态已失效，正在跳转 GitHub 重新登录。')
        await loginWithGithub()
        return
      }

      setActionMessage(error.message || '回复发布失败，请稍后再试。')
    } finally {
      setReplyPending(false)
    }
  }

  const handleLike = async (commentId) => {
    if (!(await ensureAuthenticated('点赞'))) return

    setLikePendingMap((prevLikePendingMap) => ({
      ...prevLikePendingMap,
      [commentId]: true,
    }))

    try {
      const payload = await fetchJson(`/api/blog/comments/${commentId}/like`, {
        method: 'POST',
      })

      const nextLiked = Boolean(payload.data.liked)

      setComments((prevComments) =>
        updateCommentLikeState(prevComments, commentId, payload.data.likeCount, nextLiked)
      )

      const nextLikedCommentMap = {
        ...likedCommentMap,
      }

      if (nextLiked) {
        nextLikedCommentMap[commentId] = true
      } else {
        delete nextLikedCommentMap[commentId]
      }

      setLikedCommentMap(nextLikedCommentMap)

      if (currentUserId) {
        persistLikedCommentMap(currentUserId, nextLikedCommentMap)
      }

      setActionMessage(nextLiked ? '点赞成功。' : '已取消点赞。')
    } catch (error) {
      if (error.status === 401) {
        clearLocalAuthCache()
        setActionMessage('登录状态已失效，正在跳转 GitHub 重新登录。')
        await loginWithGithub()
        return
      }

      setActionMessage(error.message || '点赞失败，请稍后再试。')
    } finally {
      setLikePendingMap((prevLikePendingMap) => ({
        ...prevLikePendingMap,
        [commentId]: false,
      }))
    }
  }

  const isReplyOpen = (commentId, targetName, replyId = null) =>
    activeReply?.commentId === commentId &&
    activeReply?.targetName === targetName &&
    activeReply?.replyId === replyId

  const renderAvatar = (name, tone, avatar, variant = 'comment') => {
    const avatarClassName = variant === 'reply' ? styles.replyAvatar : styles.avatar
    const initial = name?.slice(0, 1)?.toUpperCase() || '?'

    return (
      <div className={`${avatarClassName} ${styles[tone]}`}>
        {avatar ? (
          <span
            className={styles.avatarImage}
            style={{ backgroundImage: `url(${avatar})` }}
            aria-hidden="true"
          />
        ) : (
          initial
        )}
      </div>
    )
  }

  const renderReplyBox = (commentId, textareaId) => (
    <form className={styles.replyBox} onSubmit={(event) => handleReplySubmit(event, commentId)}>
      <div className={styles.replyBoxHeader}>
        <label htmlFor={textareaId}>正在回复</label>
        <span>@{activeReply.targetName}</span>
      </div>
      <textarea
        id={textareaId}
        value={replyContent}
        onChange={(event) => setReplyContent(event.target.value)}
        placeholder={`回复 @${activeReply.targetName}`}
        maxLength="2000"
        autoFocus
      />
      <div className={styles.replyToolbar}>
        <span>{replyContent.length}/2000</span>
        <div>
          <button
            type="button"
            onClick={() => {
              setActiveReply(null)
              setReplyContent('')
            }}
          >
            取消
          </button>
          <button type="submit" disabled={replyPending || !replyContent.trim()}>
            {replyPending ? '提交中' : '回复'}
          </button>
        </div>
      </div>
    </form>
  )

  return (
    <section className={`${styles.comment} ${className}`} id="comment">
      <div className={styles.petals} aria-hidden="true"></div>

      <form className={styles.messageBox} onSubmit={handleSubmit}>
        <h2 className={styles.messageTitle}>
          <span className={styles.titleIcon}></span>
          留言
        </h2>
        <div className={styles.editor}>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={
              articleId
                ? currentUser
                  ? `说点什么吧，欢迎在${articleLabel}下留言。`
                  : `通过 GitHub 登录后，就可以在${articleLabel}下留言了。`
                : '评论功能暂时不可用。'
            }
            maxLength="2000"
            disabled={!articleId}
          />
          <div className={styles.editorArt} aria-hidden="true">
            <div className={styles.easle}>Mashiro<br />桌子旁</div>
            <div className={styles.cat}></div>
            <div className={styles.shelf}></div>
          </div>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.statusArea}>
            {currentUser ? (
              <div className={styles.userBadge}>
                <span className={styles.userBadgeLabel}>已登录</span>
                <strong className={styles.userBadgeName}>{currentUser.username || currentUser.name}</strong>
              </div>
            ) : (
              <button className={styles.loginButton} type="button" onClick={() => void loginWithGithub()}>
                GitHub 登录
              </button>
            )}
            <p className={styles.actionMessage}>
              {actionMessage || (currentUser ? '' : '  ')}
            </p>
          </div>
          <button type="submit" disabled={submitPending || !articleId || (Boolean(currentUser) && !content.trim())}>
            {submitPending ? '提交中' : '提交'}
          </button>
        </div>
      </form>

      <div className={styles.listHeader}>
        <h3>Comments</h3>
        <span>|</span>
        <strong>{commentTotal} 条留言</strong>
      </div>

      {loading && (
        <div className={styles.feedbackCard}>
          <p>评论加载中...</p>
        </div>
      )}

      {!loading && loadError && (
        <div className={styles.feedbackCard}>
          <p>{loadError}</p>
          <div className={styles.feedbackActions}>
            <button className={styles.retryButton} type="button" onClick={() => void refreshComments()}>
              重新加载
            </button>
          </div>
        </div>
      )}

      {!loading && !loadError && comments.length === 0 && (
        <div className={styles.feedbackCard}>
          <p>还没有留言，来抢沙发吧。</p>
        </div>
      )}

      {!loadError && comments.length > 0 && (
        <div className={styles.commentList}>
          {comments.map((comment) => (
            <article className={styles.commentItem} key={comment.id}>
              {renderAvatar(comment.name, comment.avatarTone, comment.avatar)}

              <div className={styles.commentMain}>
                <div className={styles.commentTop}>
                  <div className={styles.author}>
                    <div>
                      <strong>{comment.name}</strong>
                      <span className={styles.level}>{comment.level}</span>
                      <span className={styles.badge}>{comment.badge}</span>
                    </div>
                    <time>{comment.date}</time>
                  </div>
                </div>

                <p>{comment.content}</p>

                <div className={styles.commentActions}>
                  <button
                    className={likedCommentMap[comment.id] ? styles.likedAction : ''}
                    type="button"
                    aria-label="点赞评论"
                    disabled={Boolean(likePendingMap[comment.id])}
                    onClick={() => void handleLike(comment.id)}
                  >
                    <span
                      className={`iconfont ${likedCommentMap[comment.id] ? 'icon-xihuan' : 'icon-xihuan1'} ${styles.icon}`}
                      aria-hidden="true"
                    ></span>
                    赞 {comment.likeCount}
                  </button>
                  <button
                    className={isReplyOpen(comment.id, comment.name) ? styles.activeAction : ''}
                    type="button"
                    onClick={() => void openReply(comment.id, comment.name)}
                  >
                    <span
                      className={`iconfont icon-huifu ${styles.icon}`}
                      aria-hidden="true"
                    ></span>
                    回复
                  </button>
                </div>

                {activeReply?.commentId === comment.id && activeReply.replyId === null && (
                  renderReplyBox(comment.id, `reply-${comment.id}`)
                )}

                {comment.replies.length > 0 && (
                  <button className={styles.replyToggle} type="button" onClick={() => toggleReplies(comment.id)}>
                    {expandedReplies[comment.id]
                      ? '收起评论'
                      : `展开评论 (${comment.replies.length})`}
                  </button>
                )}

                {comment.replies.length > 0 && expandedReplies[comment.id] && (
                  <div className={styles.replyList}>
                    {comment.replies.map((reply) => (
                      <div className={styles.replyItem} key={reply.id}>
                        {renderAvatar(reply.name, reply.avatarTone, reply.avatar, 'reply')}
                        <div className={styles.replyMain}>
                          <div className={styles.replyMeta}>
                            <strong>{reply.name}</strong>
                            <span>回复</span>
                            <button
                              className={styles.replyTarget}
                              type="button"
                              onClick={() => void openReply(comment.id, reply.name, reply.id)}
                            >
                              @{reply.replyToName}
                            </button>
                            <time>{reply.date}</time>
                          </div>
                          <p>{reply.content}</p>
                          <div className={styles.commentActions}>
                            <button
                              className={likedCommentMap[reply.id] ? styles.likedAction : ''}
                              type="button"
                              aria-label="点赞回复"
                              disabled={Boolean(likePendingMap[reply.id])}
                              onClick={() => void handleLike(reply.id)}
                            >
                              <span
                                className={`iconfont ${likedCommentMap[reply.id] ? 'icon-xihuan' : 'icon-xihuan1'} ${styles.icon}`}
                                aria-hidden="true"
                              ></span>
                              赞 {reply.likeCount}
                            </button>
                            <button
                              className={isReplyOpen(comment.id, reply.name, reply.id) ? styles.activeAction : ''}
                              type="button"
                              onClick={() => void openReply(comment.id, reply.name, reply.id)}
                            >
                              <span
                                className={`iconfont icon-huifu ${styles.icon}`}
                                aria-hidden="true"
                              ></span>
                              回复
                            </button>
                          </div>
                          {activeReply?.commentId === comment.id && activeReply.replyId === reply.id && (
                            renderReplyBox(comment.id, `reply-${comment.id}-${reply.id}`)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Comment
