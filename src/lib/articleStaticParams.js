import path from 'node:path'
import { readdir } from 'node:fs/promises'

const ARTICLES_ROOT = path.join(process.cwd(), 'src', 'content', 'articles')

export async function getArticleStaticParams() {
  const categoryDirs = await readdir(ARTICLES_ROOT, { withFileTypes: true })
  const params = []

  for (const categoryDir of categoryDirs) {
    if (!categoryDir.isDirectory()) continue

    const categoryPath = path.join(ARTICLES_ROOT, categoryDir.name)
    const articleFiles = await readdir(categoryPath, { withFileTypes: true })

    for (const articleFile of articleFiles) {
      if (!articleFile.isFile() || !articleFile.name.endsWith('.mdx')) continue

      params.push({
        slug: [categoryDir.name, articleFile.name.replace(/\.mdx$/, '')],
      })
    }
  }

  return params
}
