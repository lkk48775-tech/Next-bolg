'use client'

import { useEffect, useRef, useState } from 'react'
import { useBlogContext } from '@/context/BlogContext'
import styles from './ArticleDetail.module.css'

const ARTICLE_THEME_STORAGE_KEY = 'article-color-theme'

const articleThemes = [
  { key: 'classic', label: '经典' },
  { key: 'sky', label: '天蓝色' },
  { key: 'purple', label: '淡紫色' },
]

const getStoredArticleTheme = () => {
  if (typeof window === 'undefined') return 'classic'
  const storedTheme = window.sessionStorage.getItem(ARTICLE_THEME_STORAGE_KEY)
  return articleThemes.some((theme) => theme.key === storedTheme) ? storedTheme : 'classic'
}

export default function ArticleDetailClient({ hero, typingText, children }) {
  const { scrollTop = 0 } = useBlogContext()
  const [typedDesc, setTypedDesc] = useState('')
  const [tocItems, setTocItems] = useState([])
  const [activeHeading, setActiveHeading] = useState('')
  const [isPictureVisible, setIsPictureVisible] = useState(true)
  const [articleTheme, setArticleTheme] = useState('classic')
  const contentRef = useRef(null)
  const pictureRef = useRef(null)
  const tocTrackRef = useRef(null)
  const tocJumpLockRef = useRef(false)

  useEffect(() => {
    setArticleTheme(getStoredArticleTheme())
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    window.sessionStorage.setItem(ARTICLE_THEME_STORAGE_KEY, articleTheme)
  }, [articleTheme])

  useEffect(() => {
    const desc = typingText || ''
    const resetFrame = window.requestAnimationFrame(() => {
      setTypedDesc('')
    })

    if (!desc) {
      return () => {
        window.cancelAnimationFrame(resetFrame)
      }
    }

    const descChars = Array.from(desc)
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedDesc(descChars.slice(0, index).join(''))
      if (index >= descChars.length) {
        window.clearInterval(timer)
      }
    }, 42)

    return () => {
      window.cancelAnimationFrame(resetFrame)
      window.clearInterval(timer)
    }
  }, [typingText])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const contentNode = contentRef.current
      if (!contentNode) return

      const headings = Array.from(contentNode.querySelectorAll('h1, h2, h3, h4')).filter((heading) =>
        heading.textContent?.trim()
      )

      const nextTocItems = headings.map((heading, index) => {
        const text = heading.textContent.trim()
        const id = `article-heading-${index}-${text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\u4e00-\u9fa5-]/g, '')}`

        heading.id = id

        return {
          id,
          text,
          level: Number(heading.tagName.slice(1)),
        }
      })

      setTocItems(nextTocItems)
      setActiveHeading(nextTocItems[0]?.id || '')
    })

    return () => window.cancelAnimationFrame(frame)
  }, [children])

  useEffect(() => {
    if (!tocItems.length) return undefined

    const headings = tocItems.map((item) => document.getElementById(item.id)).filter(Boolean)
    if (!headings.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length) {
          setActiveHeading((prev) => (prev === visible[0].target.id ? prev : visible[0].target.id))
        }
      },
      { rootMargin: '-96px 0px -62% 0px', threshold: 0 }
    )

    headings.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [tocItems])

  useEffect(() => {
    const pictureNode = pictureRef.current
    if (!pictureNode) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPictureVisible(entry.isIntersecting)
      },
      { rootMargin: '120px 0px', threshold: 0 }
    )

    observer.observe(pictureNode)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const tocTrack = tocTrackRef.current
    if (!tocTrack || !tocItems.length) return undefined

    let frame = 0
    const syncTocScroll = () => {
      if (tocJumpLockRef.current) return

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

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', syncTocScroll)
      window.removeEventListener('resize', syncTocScroll)
    }
  }, [tocItems])

  const handleTocClick = (event, id) => {
    event.preventDefault()
    const heading = document.getElementById(id)
    if (!heading) return

    tocJumpLockRef.current = true
    window.history.replaceState(null, '', `#${id}`)
    const top = window.scrollY + heading.getBoundingClientRect().top - 96
    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth',
    })
    window.setTimeout(() => {
      tocJumpLockRef.current = false
    }, 420)
  }

  return (
    <>
      <div className={`${styles.headers} ${scrollTop > 270 ? styles.hiddenHeaders : ''}`}></div>

      <div className={styles.picture} ref={pictureRef}>
        {hero}
        <div className={styles.pictureTags}>
          {articleThemes.map((theme) => (
            <button
              className={articleTheme === theme.key ? styles.activeThemeButton : ''}
              key={theme.key}
              type="button"
              onClick={() => setArticleTheme(theme.key)}
            >
              {theme.label}
            </button>
          ))}
        </div>
        <div className={`${styles.stage} ${isPictureVisible ? '' : styles.pausedStage}`}>
          <div className={styles.runner}>
            <div className={styles.preson}></div>
          </div>
        </div>
      </div>

      <div className={`${styles.articleShell} ${styles[`theme-${articleTheme}`]}`}>
        <main className={styles.page}>
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <span className={styles.category}>Article brief</span>
              <span className={styles.headerHint}>Summary</span>
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
            <article className={styles.content} data-article-content ref={contentRef}>
              {children}
            </article>
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
                  onClick={(event) => handleTocClick(event, item.id)}
                >
                  {item.text}
                </a>
              ))}
            </div>
          </aside>
        )}
      </div>
    </>
  )
}
