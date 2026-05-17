'use client'

import dynamic from 'next/dynamic'

const Comment = dynamic(() => import('@/components/Comment'), {
  ssr: false,
  loading: () => <p>评论模块加载中...</p>,
})

export default function CommentShell({ className = '', articleId, title = '' }) {
  return <Comment className={className} articleId={articleId} title={title} />
}
