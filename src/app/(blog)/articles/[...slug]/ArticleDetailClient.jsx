/**
 * 文章详情页组件（Client Component）
 * 
 * 从后端获取文章数据，用 next-mdx-remote 渲染 MDX 内容。
 * 数据库中存的是纯 Markdown/MDX 格式（代码块用 ```语言 围栏语法）。
 * 通过 components 映射把代码块自动渲染成 CodeWindow 组件。
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useBlogContext } from '@/context/BlogContext.jsx'
import Comment from '@/components/Comment/index.jsx'
import CodeWindow from '@/components/CodeWindow/index.jsx'
import EssayActions from '@/components/EssayActions/index.jsx'
import articleHero from '@/assets/1-lite.webp'
import axios from 'axios'
import { MDXRemote } from 'next-mdx-remote'
import styles from './ArticleDetail.module.css'

const ARTICLE_THEME_STORAGE_KEY = 'article-color-theme'

const articleThemes = [
  { key: 'classic', label: '经典' },
  { key: 'sky', label: '天蓝色' },
  { key: 'purple', label: '淡紫色' }
]

const getStoredArticleTheme = () => {
  if (typeof window === 'undefined') return 'classic'
  const storedTheme = window.sessionStorage.getItem(ARTICLE_THEME_STORAGE_KEY)
  return articleThemes.some((t) => t.key === storedTheme) ? storedTheme : 'classic'
}

/**
 * 自定义 components 映射：
 * 把 Markdown 的 ```代码块 自动渲染成 CodeWindow 组件
 * Markdown 的 ```css 会变成 <pre><code className="language-css">...</code></pre>
 * 我们拦截 pre 标签，提取语言和代码内容，传给 CodeWindow
 */
const mdxComponents = {
  // 拦截 <pre> 标签（Markdown 代码块会被编译成 <pre><code>...</code></pre>）
  pre: ({ children }) => {
    // children 是 <code> 元素
    if (!children || !children.props) return <pre>{children}</pre>

    const code = children.props.children || ''
    const className = children.props.className || ''
    // className 格式如 "language-css"，提取语言名
    const lang = className.replace('language-', '').toUpperCase() || 'CODE'

    return <CodeWindow lang={lang} code={code} />
  },
  // 保持其他元素的样式
  table: (props) => <table className={styles.mdxTable} {...props} />,
  th: (props) => <th {...props} />,
  td: (props) => <td {...props} />,
}

export default function ArticleDetailClient() {
  const { scrollTop = 0 } = useBlogContext()
  const params = useParams()
  const slug = params.slug?.join('/')

  const [articleData, setArticleData] = useState(null)
  const [mdxSource, setMdxSource] = useState(null)
  const [status, setStatus] = useState('loading')
  const [typedDesc, setTypedDesc] = useState('')
  const [tocItems, setTocItems] = useState([])
  const [activeHeading, setActiveHeading] = useState('')
  const [isPictureVisible, setIsPictureVisible] = useState(true)
  const [articleTheme, setArticleTheme] = useState('classic')
  const contentRef = useRef(null)
  const pictureRef = useRef(null)
    const tocTrackRef = useRef(null)

  useEffect(() => { setArticleTheme(getStoredArticleTheme()) }, [])
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [slug])
  useEffect(() => { window.sessionStorage.setItem(ARTICLE_THEME_STORAGE_KEY, articleTheme) }, [articleTheme])

  // 从后端获取文章数据并编译 MDX
  useEffect(() => {
    let alive = true
    async function loadArticle() {
      setStatus('loading')
      setArticleData(null)
      setMdxSource(null)

      if (!slug) { setStatus('not-found'); return }
      const articleSlug = slug.split('/').pop()

      try {
        // 1. 从后端获取文章数据
        const res = await axios.get('/api/blog/article', { params: { slug: articleSlug } })
        if (!alive) return
        if (res.data.code !== 200 || !res.data.data) { setStatus('not-found'); return }

        const data = res.data.data
        setArticleData(data)

        // 2. 编译 MDX 内容
        if (data.content) {
          // 动态导入 serialize（只在需要时加载）
          const { serialize } = await import('next-mdx-remote/serialize')
          const { default: remarkGfm } = await import('remark-gfm')

          // 清理内容：去掉 import/export 语句和外层 div 包裹
          let cleanContent = data.content
            .replace(/^import\s+.+$/gm, '')
            .replace(/^export\s+const\s+\w+\s*=\s*\{[\s\S]*?\}/gm, '')
            .replace(/<div\s+className=\{styles\.\w+\}>/g, '')
            .replace(/<\/div>\s*$/g, '')
            .trim()

          // 把 <CodeWindow lang="xxx" code={`...`} /> 转换成标准 Markdown 代码块
          // 这样 serialize 就能正确处理
          cleanContent = cleanContent.replace(
            /<CodeWindow\s+lang="([^"]+)"\s+code=\{`([\s\S]*?)`\}\s*\/>/g,
            (match, lang, code) => {
              return '\n```' + lang.toLowerCase() + '\n' + code.trim() + '\n```\n'
            }
          )
        
          const mdx = await serialize(cleanContent, {
            mdxOptions: { remarkPlugins: [remarkGfm] }
          })
          if (alive) setMdxSource(mdx)
        }

        if (alive) setStatus('success')
      } catch (err) {
        console.error('加载文章失败：', err)
        if (alive) setStatus('not-found')
      }
    }
    loadArticle()
    return () => { alive = false }
  }, [slug])

  // 打字机效果
  useEffect(() => {
    const desc = articleData ? (articleData.title + '：' + (articleData.summary || '')) : ''
    const resetFrame = window.requestAnimationFrame(() => { setTypedDesc('') })
    if (!desc) return () => { window.cancelAnimationFrame(resetFrame) }
    const descChars = Array.from(desc)
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedDesc(descChars.slice(0, index).join(''))
      if (index >= descChars.length) window.clearInterval(timer)
    }, 42)
    return () => { window.cancelAnimationFrame(resetFrame); window.clearInterval(timer) }
  }, [articleData])

  // 生成目录
  useEffect(() => {
    if (status !== 'success' || !mdxSource) { setTocItems([]); setActiveHeading(''); return }
    // 延迟一帧等 MDX 渲染完成后再扫描标题
    const frame = window.requestAnimationFrame(() => {
      const contentNode = contentRef.current
      if (!contentNode) return
      const headings = Array.from(contentNode.querySelectorAll('h1, h2, h3, h4')).filter((h) => h.textContent?.trim())
      const nextTocItems = headings.map((heading, index) => {
        const text = heading.textContent.trim()
        const id = `article-heading-${index}-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')}`
        heading.id = id
        return { id, text, level: Number(heading.tagName.slice(1)) }
      })
      setTocItems(nextTocItems)
      setActiveHeading(nextTocItems[0]?.id || '')
    })
    return () => window.cancelAnimationFrame(frame)
  }, [mdxSource, status])

  // 目录高亮
  useEffect(() => {
    if (!tocItems.length) return undefined
    const headings = tocItems.map((item) => document.getElementById(item.id)).filter(Boolean)
    if (!headings.length) return undefined
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible.length) setActiveHeading((prev) => prev === visible[0].target.id ? prev : visible[0].target.id)
    }, { rootMargin: '-96px 0px -62% 0px', threshold: 0 })
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [tocItems])

  // 头图可见性
  useEffect(() => {
    const pictureNode = pictureRef.current
    if (!pictureNode) return undefined
    const observer = new IntersectionObserver(([entry]) => { setIsPictureVisible(entry.isIntersecting) }, { rootMargin: '120px 0px', threshold: 0 })
    observer.observe(pictureNode)
    return () => observer.disconnect()
  }, [status])

  // 目录滚动同步
  useEffect(() => {
    const tocTrack = tocTrackRef.current
    if (!tocTrack || !tocItems.length) return undefined
    let frame = 0
    const syncTocScroll = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const pageMaxScroll = document.documentElement.scrollHeight - window.innerHeight
        const tocMaxScroll = tocTrack.scrollHeight - tocTrack.clientHeight
        if (pageMaxScroll <= 0 || tocMaxScroll <= 0) return
        tocTrack.scrollTop = tocMaxScroll * (window.scrollY / pageMaxScroll)
      })
    }
    syncTocScroll()
    window.addEventListener('scroll', syncTocScroll, { passive: true })
    window.addEventListener('resize', syncTocScroll)
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('scroll', syncTocScroll); window.removeEventListener('resize', syncTocScroll) }
  }, [tocItems])

  const handleTocClick = (event, id) => {
    event.preventDefault()
    const heading = document.getElementById(id)
    if (!heading) return
    window.history.replaceState(null, '', `#${id}`)
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (status === 'not-found') {
    return (
      <main className={styles.page}>
        <div className={styles.state}>
          <h2>文章不存在</h2>
          <Link href="/">返回首页</Link>
        </div>
      </main>
    )
  }
 console.log(mdxSource);
  return (
    <>
      <div className={`${styles.headers} ${scrollTop > 270 ? styles.hiddenHeaders : ''}`}></div>
      <div className={styles.picture} ref={pictureRef}>
        <Image className={styles.pictureImage} src={articleHero} alt="" priority fill sizes="100vw" style={{ objectFit: 'cover' }} />
          <div className={styles.pictureInfo}>
            <h1>{articleData?.description || 'POETIZE'}</h1>
            <div className={styles.pictureMeta}>
              <span>Sakura</span><span>·</span><span>2025年</span><span>·</span><span>1006</span><span>·</span><span>1</span>
            </div>
            {articleData?.id && (
              <EssayActions
                title={articleData.title}
                desc={articleData.summary || articleData.description || ''}
                articleId={articleData.id}
                likeCount={articleData.likeCount || articleData.like_count || 0}
                liked={Boolean(articleData.liked)}
              />
            )}
          </div>
        <div className={styles.pictureTags}>
          {articleThemes.map((theme) => (
            <button className={articleTheme === theme.key ? styles.activeThemeButton : ''} type="button" key={theme.key} onClick={() => setArticleTheme(theme.key)}>{theme.label}</button>
          ))}
        </div>
        <div className={`${styles.stage} ${isPictureVisible ? '' : styles.pausedStage}`}>
          <div className={styles.runner}><div className={styles.preson}></div></div>
        </div>
      </div>

      <div className={`${styles.articleShell} ${styles[`theme-${articleTheme}`]}`}>
        <main className={styles.page}>
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <span className={styles.category}>{articleData?.category_name || 'Frontend'}</span>
              <span className={styles.headerHint}>Article brief</span>
            </div>
            <div className={styles.descCard}>
              <span className={styles.quoteMark}>&ldquo;</span>
              <p className={styles.typingText}>
                {typedDesc}
                <span className={styles.cursor} aria-hidden="true" />
              </p>
            </div>
          </div>

          <div className={styles.articleFrame}>
            <article className={styles.content} ref={contentRef}>
              {status === 'loading' && (
                <div className={styles.articleLoading}><span></span><span></span><span></span><span></span></div>
              )}
              {mdxSource && <MDXRemote {...mdxSource} components={mdxComponents} />}
            </article>
            {status === 'success' && (
              <Comment
                className={styles.articleComment}
                articleId={articleData?.id}
                title={articleData?.title}
              />
            )}
          </div>
        </main>

        {tocItems.length > 0 && (
          <aside className={styles.toc}>
            <div className={styles.tocTrack} ref={tocTrackRef}>
              {tocItems.map((item) => (
                <a
                  className={`${styles.tocItem} ${styles[`tocLevel${item.level}`]} ${activeHeading === item.id ? styles.activeTocItem : ''}`}
                  href={`#${item.id}`}
                  key={item.id}
                  onClick={(e) => handleTocClick(e, item.id)}
                >{item.text}</a>
              ))}
            </div>
          </aside>
        )}
      </div>
    </>
  )
}
