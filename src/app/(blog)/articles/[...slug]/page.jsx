import Image from 'next/image'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import SessionProviderShell from '@/components/SessionProviderShell'
import ArticleDetailClient from './ArticleDetailClient'
import CodeWindow from '@/components/CodeWindow'
import CommentShell from '@/components/CommentShell'
import EssayActions from '@/components/EssayActions'
import articleHero from '@/assets/1-lite.webp'
import styles from './ArticleDetail.module.css'
import { getArticleBySlug, normalizeArticleMdx } from '@/lib/articleDetail'
import { getArticleStaticParams } from '@/lib/articleStaticParams'

export const revalidate = 300

export async function generateStaticParams() {
  return getArticleStaticParams()
}

const mdxComponents = {
  pre: ({ children }) => {
    if (!children?.props) return <pre>{children}</pre>

    const code = children.props.children || ''
    const className = children.props.className || ''
    const lang = className.replace('language-', '').toUpperCase() || 'CODE'

    return <CodeWindow lang={lang} code={code} />
  },
  table: (props) => <table className={styles.mdxTable} {...props} />,
  th: (props) => <th {...props} />,
  td: (props) => <td {...props} />,
}

export default async function ArticleDetailPage({ params }) {
  const resolvedParams = await params
  const slugParts = resolvedParams?.slug || []
  const articleSlug = slugParts[slugParts.length - 1]

  if (!articleSlug) {
    notFound()
  }

  const article = await getArticleBySlug(articleSlug)

  if (!article) {
    notFound()
  }

  const mdxSource = normalizeArticleMdx(article.content || '')
  const typingText = `${article.title}${article.summary ? `：${article.summary}` : ''}`

  return (
    <SessionProviderShell>
      <ArticleDetailClient
        typingText={typingText}
        hero={(
          <>
            <Image
              className={styles.pictureImage}
              src={articleHero}
              alt=""
              priority
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.pictureInfo}>
              <h1>{article.description || 'POETIZE'}</h1>
              <div className={styles.pictureMeta}>
                <span>Sakura</span>
                <span>·</span>
                <span>{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
                <span>·</span>
                <span>{article.category_name || 'Frontend'}</span>
              </div>
              <EssayActions
                title={article.title}
                desc={article.summary || article.description || ''}
                articleId={article.id}
                likeCount={article.like_count || 0}
                liked={false}
              />
            </div>
          </>
        )}
      >
        {mdxSource ? (
          <MDXRemote
            source={mdxSource}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        ) : (
          <div className={styles.state}>
            <p>这篇文章暂时还没有正文内容。</p>
          </div>
        )}

        <CommentShell
          className={styles.articleComment}
          articleId={article.id}
          title={article.title}
        />
      </ArticleDetailClient>
    </SessionProviderShell>
  )
}
