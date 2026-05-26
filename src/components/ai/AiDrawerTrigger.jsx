'use client'

import { useEffect, useRef, useState } from 'react'
import AiPopup from '@/components/ai/AiPopup'
import styles from '@/app/(blog)/Home.module.css'

const triggerSize = 128
const aiTips = [
  '我是 AI 助手',
  '可以查博客内容',
  '也会推荐音乐',
  '摸鱼日报已就绪',
  'CSS 又赢了',
  'Bug 只是特性',
  '缓存说它没错',
  '变量名想好了',
  '先跑再说',
  '这个需求很敏捷',
  '重启治百病',
  '类型救我一下',
  '今天不写 any',
]

export default function AiDrawerTrigger() {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ right: 24, bottom: 24 })
  const [tipIndex, setTipIndex] = useState(0)
  const dragState = useRef(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTipIndex((index) => (index + 1) % aiTips.length)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [])

  const startDrag = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startRight: position.right,
      startBottom: position.bottom,
      moved: false,
    }
  }

  const drag = (event) => {
    if (!dragState.current) return

    const nextRight = dragState.current.startRight - (event.clientX - dragState.current.startX)
    const nextBottom = dragState.current.startBottom - (event.clientY - dragState.current.startY)
    const maxRight = window.innerWidth - triggerSize
    const maxBottom = window.innerHeight - triggerSize

    if (Math.abs(event.clientX - dragState.current.startX) > 4 || Math.abs(event.clientY - dragState.current.startY) > 4) {
      dragState.current.moved = true
    }

    setPosition({
      right: Math.min(Math.max(nextRight, 8), maxRight),
      bottom: Math.min(Math.max(nextBottom, 8), maxBottom),
    })
  }

  const endDrag = () => {
    window.setTimeout(() => {
      dragState.current = null
    }, 0)
  }

  return (
    <>
      {!open && (
        <button
          className={styles.ai}
          onClick={() => {
            if (!dragState.current?.moved) {
              setOpen(true)
            }
          }}
          onPointerDown={startDrag}
          onPointerMove={drag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{
            right: `${position.right}px`,
            bottom: `${position.bottom}px`,
          }}
          type="button"
        >
          <span className={styles.aiTip}>{aiTips[tipIndex]}</span>
          <img
            className={styles.aiImage}
            src="/images/ai-sidebar-robot-64.webp"
            alt="AI助手"
            draggable={false}
          />
        </button>
      )}

      <div
        className={`${styles.aiDrawerOverlay} ${open ? styles.aiDrawerOverlayOpen : ''}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`${styles.aiDrawer} ${open ? styles.aiDrawerOpen : ''}`}>
        <AiPopup embedded onClose={() => setOpen(false)} />
      </aside>
    </>
  )
}
