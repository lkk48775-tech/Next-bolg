import db from "@/lib/db"

const avatarTones = ["ink", "blue", "bot", "guest"]

const getAvatarTone = (name = "") => {
  const seed = Array.from(name).reduce((total, char) => total + char.codePointAt(0), 0)
  return avatarTones[seed % avatarTones.length]
}

const formatDateLabel = (value) => {
  if (!value) return ""

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(value))
    .replace(/\//g, "-")
}

const getLevelLabel = (totalComments = 0) => {
  const nextLevel = Math.min(9, Math.max(1, Math.floor(totalComments / 3) + 1))
  return `LV${nextLevel}`
}

const mapCommentRecord = (row) => ({
  id: row.id,
  name: row.username,
  level: getLevelLabel(row.total_comments),
  badge: "GitHub",
  date: formatDateLabel(row.created_at),
  content: row.content,
  likeCount: row.like_count || 0,
  liked: Boolean(row.viewer_liked),
  replyCount: row.reply_count || 0,
  avatarTone: getAvatarTone(row.username),
  avatar: row.avatar || null,
  createdAt: row.created_at,
})

const mapReplyRecord = (row) => ({
  id: row.id,
  name: row.username,
  replyToName: row.parent_username || row.username,
  date: formatDateLabel(row.created_at),
  content: row.content,
  likeCount: row.like_count || 0,
  liked: Boolean(row.viewer_liked),
  avatarTone: getAvatarTone(row.username),
  avatar: row.avatar || null,
  createdAt: row.created_at,
})

export const getArticleComments = async (articleId, viewerUserId = null) => {
  const [rows] = await db.query(
    `
      SELECT
        c.id,
        c.content,
        c.like_count,
        c.reply_count,
        c.article_id,
        c.user_id,
        c.parent_id,
        c.root_id,
        c.created_at,
        u.username,
        u.avatar,
        parent_user.username AS parent_username,
        CASE WHEN viewer_comment_like.id IS NULL THEN 0 ELSE 1 END AS viewer_liked,
        COALESCE(user_stats.total_comments, 0) AS total_comments
      FROM \`comment\` c
      INNER JOIN \`user\` u ON u.id = c.user_id
      LEFT JOIN \`comment\` parent_comment ON parent_comment.id = c.parent_id
      LEFT JOIN \`user\` parent_user ON parent_user.id = parent_comment.user_id
      LEFT JOIN \`comment_like\` viewer_comment_like
        ON viewer_comment_like.comment_id = c.id
        AND viewer_comment_like.user_id = ?
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS total_comments
        FROM \`comment\`
        GROUP BY user_id
      ) user_stats ON user_stats.user_id = c.user_id
      WHERE c.article_id = ?
      ORDER BY c.created_at ASC, c.id ASC
    `,
    [viewerUserId || 0, articleId]
  )

  const topLevelComments = []
  const repliesByRootId = new Map()

  for (const row of rows) {
    if (row.parent_id == null) {
      topLevelComments.push({
        ...mapCommentRecord(row),
        replies: [],
      })
      continue
    }

    const rootId = row.root_id || row.parent_id
    const currentReplies = repliesByRootId.get(rootId) || []
    currentReplies.push(mapReplyRecord(row))
    repliesByRootId.set(rootId, currentReplies)
  }

  topLevelComments.sort((left, right) => {
    const timeDiff = new Date(right.createdAt) - new Date(left.createdAt)
    return timeDiff || right.id - left.id
  })

  for (const comment of topLevelComments) {
    const replies = repliesByRootId.get(comment.id) || []
    replies.sort((left, right) => {
      const timeDiff = new Date(left.createdAt) - new Date(right.createdAt)
      return timeDiff || left.id - right.id
    })
    comment.replies = replies.map((reply) => {
      const nextReply = { ...reply }
      delete nextReply.createdAt
      return nextReply
    })
  }

  return topLevelComments.map((comment) => {
    const nextComment = { ...comment }
    delete nextComment.createdAt
    return nextComment
  })
}
