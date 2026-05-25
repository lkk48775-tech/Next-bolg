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
import { createArticleHeadingId, extractArticleToc, getArticleBySlug, normalizeArticleMdx } from '@/lib/articleDetail'
import { getArticleStaticParams } from '@/lib/articleStaticParams'

export const revalidate = 300

export async function generateStaticParams() {
  return getArticleStaticParams()
}

const getTextFromChildren = (children) => {
  if (children === null || children === undefined) return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(getTextFromChildren).join('')
  if (children?.props?.children) return getTextFromChildren(children.props.children)

  return ''
}

const baseMdxComponents = {
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

const createHeadingComponent = (level, getNextHeading) => {
  const Tag = `h${level}`

  return function ArticleHeading({ children, ...props }) {
    const { item: nextHeading, index } = getNextHeading()
    const text = getTextFromChildren(children)
    const id = nextHeading?.id || createArticleHeadingId(text, index)

    return (
      <Tag {...props} id={id}>
        {children}
      </Tag>
    )
  }
}

const createMdxComponents = (tocItems) => {
  let headingIndex = 0
  const getNextHeading = () => {
    const index = headingIndex
    const item = tocItems[headingIndex]
    headingIndex += 1

    return { item, index }
  }

  return {
    ...baseMdxComponents,
    h1: createHeadingComponent(1, getNextHeading),
    h2: createHeadingComponent(2, getNextHeading),
    h3: createHeadingComponent(3, getNextHeading),
    h4: createHeadingComponent(4, getNextHeading),
  }
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
  const tocItems = extractArticleToc(mdxSource)
  const mdxComponents = createMdxComponents(tocItems)
  const typingText = `${article.title}${article.summary ? `：${article.summary}` : ''}`

  return (
    <SessionProviderShell>
      <ArticleDetailClient
        typingText={typingText}
        tocItems={tocItems}
        comments={(
          <CommentShell
            className={styles.articleComment}
            articleId={article.id}
            title={article.title}
          />
        )}
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

      </ArticleDetailClient>
    </SessionProviderShell>
  )
}
