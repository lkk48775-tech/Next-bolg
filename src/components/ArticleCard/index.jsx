/**
 * 文章卡片组件（Server Component）
 * 
 * 用于首页文章列表中展示单篇文章的预览信息。
 * 整张卡片是一个链接，点击后跳转到对应文章详情页。
 * 
 * Props:
 * - slug: 文章标识符，用于生成链接路径
 * - meta: 文章分类标签（如 "JS 防抖"）
 * - title: 文章标题
 * - desc: 文章简介（超过 3 行会被截断，hover 时显示完整内容）
 * - tags: 技术标签数组
 */
import Link from 'next/link'
import { getArticlePath } from '@/content/articlePath'
import styles from './ArticleCard.module.css'

function ArticleCard({ slug, meta, title, desc, tags }) {
  return (
    // 整张卡片都是链接，点击后进入对应文章详情页
    <Link className={styles.articleCard} href={`/articles/${getArticlePath(slug)}`}>
      {/* 分类标签（左上角小徽章） */}
      <div className={styles.articleMeta}>{meta}</div>
      {/* 文章标题 */}
      <h3 className={styles.articleTitle}>{title}</h3>
      {/* 文章简介：data-full 保存完整文本，CSS 用它做 hover 提示 */}
      <div className={styles.articleDescWrap} data-full={desc}>
        <p className={styles.articleDesc}>{desc}</p>
      </div>
      {/* 技术标签列表 */}
      <div className={styles.techList}>
        {tags.map((tag) => (
          <span className={styles.techTag} key={tag}>{tag}</span>
        ))}
      </div>
    </Link>
  )
}

export default ArticleCard
