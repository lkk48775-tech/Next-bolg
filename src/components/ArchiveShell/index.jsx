/**
 * 归档页外壳组件（Client Component）
 * 
 * 从归档页 Server Component 中拆出来的交互部分。
 * 唯一需要客户端的原因：使用 ResizeObserver 测量归档卡片的高度，
 * 然后通过 CSS 变量 --archive-card-height 传给左侧 profile 区域，
 * 让 profile 的 sticky 定位能正确跟随。
 * 
 * Props:
 * - children: 归档页的内容（profile 侧边栏 + 文章时间线）
 */
'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import styles from '@/app/(blog)/TechnicalRoute/TechnicalRoute.module.css'

export default function ArchiveShell({ children }) {
  const mainRef = useRef(null)
  const [archiveCardHeight, setArchiveCardHeight] = useState(0)

  // 使用 ResizeObserver 监听归档卡片高度变化
  useLayoutEffect(() => {
    const archiveCard = mainRef.current?.querySelector('[data-archive-card]')
    if (!archiveCard) return undefined

    const update = () => { setArchiveCardHeight(archiveCard.offsetHeight) }
    update()

    const observer = new ResizeObserver(update)
    observer.observe(archiveCard)
    window.addEventListener('resize', update)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <main
      ref={mainRef}
      className={styles.page}
      style={archiveCardHeight ? { '--archive-card-height': `${archiveCardHeight}px` } : undefined}
    >
      {children}
    </main>
  )
}
