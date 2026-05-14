/**
 * 评论组件（Client Component）
 * 
 * 用于文章详情页底部，提供留言和回复功能。
 * 功能：
 * 1. 发表新评论（追加到列表顶部）
 * 2. 回复已有评论（嵌套回复）
 * 3. 展开/收起回复列表
 * 4. 评论计数（主评论 + 回复总数）
 * 
 * 数据：使用静态默认评论数据，暂未接入后端 API。
 * 
 * Props:
 * - className: 外部传入的额外样式类名
 * - initialComments: 初始评论数据（可选，默认使用内置数据）
 * - title: 文章标题（用于标识评论所属文章）
 */
'use client'

import { useMemo, useState } from 'react'
import styles from './Comment.module.css'

const defaultComments = [
  {
    id: 1,
    name: 'nclxl',
    level: 'LV1',
    badge: '结丹',
    date: '2026-05-04',
    content: '先看看',
    replies: [],
    avatarTone: 'ink'
  },
  {
    id: 2,
    name: '蓝桉',
    level: 'LV4',
    badge: '金仙',
    date: '2026-04-27',
    content: '@灵宝下载地址在哪里',
    replies: [
      {
        id: 21,
        name: '灵宝',
        replyToName: '蓝桉',
        date: '2026-04-27',
        content: '在原更新帖正文下面，相关功能那块有跳转链接。',
        avatarTone: 'bot'
      },
      {
        id: 22,
        name: '游客',
        replyToName: '蓝桉',
        date: '2026-04-28',
        content: '评论区也有人贴过，可以往上翻一下。',
        avatarTone: 'guest'
      }
    ],
    avatarTone: 'blue'
  },
  {
    id: 3,
    name: '灵宝',
    level: 'LV1',
    badge: '大乘',
    date: '2026-04-27',
    content: '哈哈哈哈蹲地址的宝子我太懂！你往原更新帖正文往下扒拉扒拉呀，相关功能那块都给你留好跳转链接了！实在找不到翻评论区，好多先行者早就把链接扒出来了，快去冲。',
    replies: [],
    avatarTone: 'bot'
  }
]

const normalizeComments = (comments) =>
  comments.map((comment) => ({
    ...comment,
    replies: Array.isArray(comment.replies) ? comment.replies : []
  }))

const getNowLabel = () =>
  new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
    .format(new Date())
    .replace(/\//g, '-')

function Comment({ className = '', initialComments = defaultComments }) {
  // comments 保存当前页面展示的评论列表，默认使用上面的静态评论。
  const [comments, setComments] = useState(() => normalizeComments(initialComments))
  // content 是评论输入框里的内容。
  const [content, setContent] = useState('')
  const [activeReply, setActiveReply] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [expandedReplies, setExpandedReplies] = useState({})

  // 评论总数 = 主评论数量 + 每条评论自己的回复数量。
  const commentTotal = useMemo(
    () => comments.length + comments.reduce((sum, comment) => sum + comment.replies.length, 0),
    [comments]
  )

  const handleSubmit = (event) => {
    // 阻止表单刷新页面，改为在当前组件里追加评论。
    event.preventDefault()
    const nextContent = content.trim()

    if (!nextContent) return

    setComments((prevComments) => [
      {
        id: Date.now(),
        name: '游客',
        level: 'LV1',
        badge: '初入',
        date: new Date().toISOString().slice(0, 10),
        content: nextContent,
        replies: [],
        avatarTone: 'guest'
      },
      ...prevComments
    ])
    setContent('')
  }

  const openReply = (commentId, targetName, replyId = null) => {
    if (
      activeReply?.commentId === commentId &&
      activeReply?.targetName === targetName &&
      activeReply?.replyId === replyId
    ) {
      setActiveReply(null)
      setReplyContent('')
      return
    }

    setActiveReply({ commentId, targetName, replyId })
    setReplyContent('')
  }

  const toggleReplies = (commentId) => {
    if (expandedReplies[commentId] && activeReply?.commentId === commentId && activeReply.replyId !== null) {
      setActiveReply(null)
    }

    setExpandedReplies((prevExpandedReplies) => ({
      ...prevExpandedReplies,
      [commentId]: !prevExpandedReplies[commentId]
    }))
  }

  const handleReplySubmit = (event, commentId) => {
    event.preventDefault()
    const nextContent = replyContent.trim()

    if (!nextContent || !activeReply) return

    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id !== commentId) return comment

        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: Date.now(),
              name: '游客',
              replyToName: activeReply.targetName,
              date: getNowLabel(),
              content: nextContent,
              avatarTone: 'guest'
            }
          ]
        }
      })
    )
    setExpandedReplies((prevExpandedReplies) => ({
      ...prevExpandedReplies,
      [commentId]: true
    }))
    setActiveReply(null)
    setReplyContent('')
  }

  const isReplyOpen = (commentId, targetName, replyId = null) => (
    activeReply?.commentId === commentId &&
    activeReply?.targetName === targetName &&
    activeReply?.replyId === replyId
  )

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
          <button type="button" onClick={() => setActiveReply(null)}>
            取消
          </button>
          <button type="submit" disabled={!replyContent.trim()}>回复</button>
        </div>
      </div>
    </form>
  )

  return (
    <section className={`${styles.comment} ${className}`} id="comment">
      {/* 装饰层，只负责视觉效果，不参与交互。 */}
      <div className={styles.petals} aria-hidden="true"></div>

      {/* 评论输入区域。 */}
      <form className={styles.messageBox} onSubmit={handleSubmit}>
        <h2 className={styles.messageTitle}>
          <span className={styles.titleIcon}>□</span>
          留言
        </h2>
        <div className={styles.editor}>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="说点什么... 想让 AI 回你？试试 @灵宝"
            maxLength="220"
          />
          <div className={styles.editorArt} aria-hidden="true">
            <div className={styles.easle}>Mashiro<br />桌子中</div>
            <div className={styles.cat}></div>
            <div className={styles.shelf}></div>
          </div>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.tools} aria-hidden="true">
            <span>◉</span>
            <span>▧</span>
          </div>
          <button type="submit">提交</button>
        </div>
      </form>

      <div className={styles.listHeader}>
        <h3>Comments</h3>
        <span>|</span>
        <strong>{commentTotal} 条留言</strong>
      </div>

      {/* 评论列表，根据 comments 状态渲染。 */}
      <div className={styles.commentList}>
        {comments.map((comment) => (
          <article className={styles.commentItem} key={comment.id}>
            <div className={`${styles.avatar} ${styles[comment.avatarTone]}`}>
              {comment.name.slice(0, 1).toUpperCase()}
            </div>

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
                <button type="button" aria-label="点赞">
                  ♡ 赞 0
                </button>
                <button
                  className={isReplyOpen(comment.id, comment.name) ? styles.activeAction : ''}
                  type="button"
                  onClick={() => openReply(comment.id, comment.name)}
                >
                  ◯ 回复
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
                      <div className={`${styles.replyAvatar} ${styles[reply.avatarTone]}`}>
                        {reply.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className={styles.replyMain}>
                        <div className={styles.replyMeta}>
                          <strong>{reply.name}</strong>
                          <span>回复</span>
                          <button
                            className={styles.replyTarget}
                            type="button"
                            onClick={() => openReply(comment.id, reply.name, reply.id)}
                          >
                            @{reply.replyToName}
                          </button>
                          <time>{reply.date}</time>
                        </div>
                        <p>{reply.content}</p>
                        <div className={styles.commentActions}>
                          <button type="button" aria-label="点赞">
                            ♡ 赞 0
                          </button>
                          <button
                            className={isReplyOpen(comment.id, reply.name, reply.id) ? styles.activeAction : ''}
                            type="button"
                            onClick={() => openReply(comment.id, reply.name, reply.id)}
                          >
                            ◯ 回复
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
    </section>
  )
}

export default Comment
