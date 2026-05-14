'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useBlogContext } from '@/context/BlogContext'
import { articleList } from '@/content/articleList'
import Comment from '@/components/Comment'
import articleHero from '@/assets/1-lite.webp'
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

// Dynamic MDX imports - map all article MDX files
const modules = {
  // CSS
  'css/css-flex': () => import('@/content/articles/css/css-flex.mdx'),
  'css/css-grid': () => import('@/content/articles/css/css-grid.mdx'),
  'css/css-line-clamp': () => import('@/content/articles/css/css-line-clamp.mdx'),
  'css/css-position-zindex': () => import('@/content/articles/css/css-position-zindex.mdx'),
  'css/css-responsive': () => import('@/content/articles/css/css-responsive.mdx'),
  'css/css-transition': () => import('@/content/articles/css/css-transition.mdx'),
  // Browser
  'browser/file-md5': () => import('@/content/articles/browser/file-md5.mdx'),
  'browser/large-file-upload': () => import('@/content/articles/browser/large-file-upload.mdx'),
  // JavaScript
  'js/js-array-methods': () => import('@/content/articles/js/js-array-methods.mdx'),
  'js/js-closure': () => import('@/content/articles/js/js-closure.mdx'),
  'js/js-debounce': () => import('@/content/articles/js/js-debounce.mdx'),
  'js/js-error-handling': () => import('@/content/articles/js/js-error-handling.mdx'),
  'js/js-event-loop': () => import('@/content/articles/js/js-event-loop.mdx'),
  'js/js-module': () => import('@/content/articles/js/js-module.mdx'),
  'js/js-prototype': () => import('@/content/articles/js/js-prototype.mdx'),
  'js/js-throttle': () => import('@/content/articles/js/js-throttle.mdx'),
  // React
  'react/dynamic-breadcrumb': () => import('@/content/articles/react/dynamic-breadcrumb.mdx'),
  'react/react-component': () => import('@/content/articles/react/react-component.mdx'),
  'react/react-controlled-form': () => import('@/content/articles/react/react-controlled-form.mdx'),
  'react/react-hooks': () => import('@/content/articles/react/react-hooks.mdx'),
  'react/react-performance': () => import('@/content/articles/react/react-performance.mdx'),
  'react/react-router': () => import('@/content/articles/react/react-router.mdx'),
  'react/react-state-render': () => import('@/content/articles/react/react-state-render.mdx'),
  'react/virtual-list': () => import('@/content/articles/react/virtual-list.mdx'),
  // Vue
  'vue/vue-component-communication': () => import('@/content/articles/vue/vue-component-communication.mdx'),
  'vue/vue-composition-api': () => import('@/content/articles/vue/vue-composition-api.mdx'),
  'vue/vue-directive': () => import('@/content/articles/vue/vue-directive.mdx'),
  'vue/vue-pinia': () => import('@/content/articles/vue/vue-pinia.mdx'),
  'vue/vue-reactive': () => import('@/content/articles/vue/vue-reactive.mdx'),
  'vue/vue-router': () => import('@/content/articles/vue/vue-router.mdx'),
}

export default function ArticleDetailClient() {
  const { scrollTop = 0 } = useBlogContext()
  const params = useParams()
  const slug = params.slug?.join('/')

  const [ArticleComponent, setArticleComponent] = useState(null)
  const [status, setStatus] = useState('loading')
  const [typedDesc, setTypedDesc] = useState('')
  const [tocItems, setTocItems] = useState([])
  const [activeHeading, setActiveHeading] = useState('')
  const [isPictureVisible, setIsPictureVisible] = useState(true)
  const [articleTheme, setArticleTheme] = useState('classic')
  const contentRef = useRef(null)
  const pictureRef = useRef(null)
  const tocTrackRef = useRef(null)

  const articleInfo = useMemo(() => (
    articleList.find((item) => item.slug === slug)
  ), [slug])

  useEffect(() => { setArticleTheme(getStoredArticleTheme()) }, [])
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [slug])
  useEffect(() => { window.sessionStorage.setItem(ARTICLE_THEME_STORAGE_KEY, articleTheme) }, [articleTheme])

  useEffect(() => {
    const desc = articleInfo?.desc || ''
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
  }, [articleInfo?.desc])

  useEffect(() => {
    let alive = true
    async function loadArticle() {
      setStatus('loading')
      setArticleComponent(null)
      if (!slug) { setStatus('not-found'); return }
      const loader = modules[slug]
      if (!loader) { setStatus('not-found'); return }
      try {
        const mod = await loader()
        if (!alive) return
        setArticleComponent(() => mod.default)
        setStatus('success')
      } catch { if (alive) setStatus('not-found') }
    }
    loadArticle()
    return () => { alive = false }
  }, [slug])

  useEffect(() => {
    if (status !== 'success' || !ArticleComponent) { setTocItems([]); setActiveHeading(''); return }
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
  }, [ArticleComponent, status])

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

  useEffect(() => {
    const pictureNode = pictureRef.current
    if (!pictureNode) return undefined
    const observer = new IntersectionObserver(([entry]) => { setIsPictureVisible(entry.isIntersecting) }, { rootMargin: '120px 0px', threshold: 0 })
    observer.observe(pictureNode)
    return () => observer.disconnect()
  }, [status])

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
          <Link href="/articles">返回文章列表</Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <div className={`${styles.headers} ${scrollTop > 270 ? styles.hiddenHeaders : ''}`}></div>
      <div className={styles.picture} ref={pictureRef}>
        <Image className={styles.pictureImage} src={articleHero} alt="" priority fill sizes="100vw" style={{ objectFit: 'cover' }} />
        <div className={styles.pictureInfo}>
          <h1>{articleInfo?.title || 'POETIZE'}</h1>
          <div className={styles.pictureMeta}>
            <span>Sakura</span><span>·</span><span>2025年</span><span>·</span><span>1006</span><span>·</span><span>1</span>
          </div>
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
              <span className={styles.category}>{articleInfo?.category || 'Frontend'}</span>
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
              {ArticleComponent && <ArticleComponent />}
            </article>
            {status === 'success' && <Comment className={styles.articleComment} title={articleInfo?.title} />}
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
