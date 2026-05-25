import { unstable_cache } from 'next/cache'
import db from '@/lib/db'

const loadArticleBySlug = unstable_cache(
  async (slug) => {
    const [rows] = await db.query(
      `
        SELECT
          a.id,
          a.title,
          a.summary,
          a.description,
          a.content,
          a.slug,
          a.tech_stack,
          a.like_count,
          a.created_at,
          c.name AS category_name
        FROM article a
        LEFT JOIN category c ON a.category_id = c.id
        WHERE a.slug = ? AND a.published = 1
        LIMIT 1
      `,
      [slug]
    )

    return rows[0] || null
  },
  ['article-detail'],
  {
    revalidate: 300,
    tags: ['article-detail'],
  }
)

export async function getArticleBySlug(slug) {
  if (!slug) return null
  return loadArticleBySlug(slug)
}

export function normalizeArticleMdx(content = '') {
  if (!content) return ''

  return content
    .replace(/^import\s+.+$/gm, '')
    .replace(/^export\s+const\s+\w+\s*=\s*\{[\s\S]*?\}/gm, '')
    .replace(/<div\s+className=\{styles\.\w+\}>/g, '')
    .replace(/<\/div>\s*$/g, '')
    .replace(
      /<CodeWindow\s+lang="([^"]+)"\s+code=\{`([\s\S]*?)`\}\s*\/>/g,
      (match, lang, code) => `\n\`\`\`${lang.toLowerCase()}\n${code.trim()}\n\`\`\`\n`
    )
    .trim()
}

export function createArticleHeadingId(text = '', index = 0) {
  const slug = String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/^-+|-+$/g, '')

  return `article-heading-${index}-${slug || 'section'}`
}

const cleanHeadingText = (value = '') =>
  value
    .replace(/\s+#+\s*$/, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export function extractArticleToc(content = '') {
  if (!content) return []

  const tocItems = []
  let fencedBlock = null

  for (const line of content.split(/\r?\n/)) {
    const trimmedLine = line.trim()
    const fenceMatch = trimmedLine.match(/^(```|~~~)/)

    if (fenceMatch) {
      fencedBlock = fencedBlock === fenceMatch[1] ? null : fenceMatch[1]
      continue
    }

    if (fencedBlock) continue

    const headingMatch = trimmedLine.match(/^(#{1,4})\s+(.+)$/)
    if (!headingMatch) continue

    const text = cleanHeadingText(headingMatch[2])
    if (!text) continue

    tocItems.push({
      id: createArticleHeadingId(text, tocItems.length),
      text,
      level: headingMatch[1].length,
    })
  }

  return tocItems
}
