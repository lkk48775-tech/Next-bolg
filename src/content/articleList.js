/**
 * 文章列表数据
 * 
 * 从 articleMetaData 中的所有文章生成带分类信息的列表。
 * 用于文章归档页（/articles）按分类展示所有文章。
 * 
 * 每篇文章包含：title（标题）、category（分类）、desc（描述）、slug（路径）
 */
import { allHomeArticles } from '@/data/articleMetaData'
import { getArticlePath } from './articlePath'

/**
 * 根据 slug 前缀判断文章所属分类
 */
const getCategory = (article) => {
  if (article.slug.startsWith('css-')) return 'CSS'
  if (article.slug.startsWith('js-')) return 'JavaScript'
  if (article.slug.startsWith('vue-')) return 'Vue'
  if (article.slug.startsWith('react-')) return 'React'
  if (article.slug.includes('breadcrumb')) return 'React Router'
  if (article.slug.includes('upload') || article.slug.includes('md5')) return 'Browser API'
  return article.tags?.[0] || 'Frontend'
}

export const articleList = allHomeArticles.map((article) => ({
  title: article.title,
  category: getCategory(article),
  desc: article.desc,
  slug: getArticlePath(article.slug)
}))
