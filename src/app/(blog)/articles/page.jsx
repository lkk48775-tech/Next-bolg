/**
 * 文章归档页（Server Component）
 * 
 * 纯服务端渲染，零客户端 JS。
 * 按分类（CSS、JavaScript、Vue、React 等）展示所有文章列表。
 * 左侧是文章列表（带时间线样式），右侧是快速导航面板。
 */
import Link from 'next/link'
import { articleList } from '@/content/articleList'
import styles from './ArticleList.module.css'

// 分类显示顺序
const categoryOrder = ['CSS', 'JavaScript', 'Vue', 'React', 'React Router', 'Browser API']

const groupedArticles = categoryOrder
  .map((category) => ({
    category,
    articles: articleList.filter((article) => article.category === category)
  }))
  .filter((section) => section.articles.length > 0)

export default function ArticlesPage() {
  return (
    <>
      <main className={styles.page}>
        <section className={styles.hero}>
          <span>Archive</span>
          <h1>文章归档</h1>
          <p>把已经整理好的技术文章按照方向归类，左侧浏览内容，右侧可以快速选择对应文章。</p>
        </section>

        <div className={styles.layout}>
          <section className={styles.archive}>
            {groupedArticles.map((section) => (
              <article className={styles.group} id={`archive-${section.category}`} key={section.category}>
                <div className={styles.groupHead}>
                  <span>{section.category}</span>
                  <strong>{section.articles.length}</strong>
                </div>
                <div className={styles.articleList}>
                  {section.articles.map((item) => (
                    <Link className={styles.articleItem} key={item.slug} href={`/articles/${item.slug}`}>
                      <span className={styles.dot}></span>
                      <div>
                        <h2>{item.title}</h2>
                        <p>{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <aside className={styles.selector}>
            <div className={styles.selectorInner}>
              {groupedArticles.map((section) => (
                <div className={styles.selectorGroup} key={section.category}>
                  <a className={styles.selectorTitle} href={`#archive-${section.category}`}>{section.category}</a>
                  {section.articles.map((item) => (
                    <Link className={styles.selectorLink} key={item.slug} href={`/articles/${item.slug}`}>{item.title}</Link>
                  ))}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
