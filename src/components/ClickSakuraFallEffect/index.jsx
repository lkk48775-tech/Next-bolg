/**
 * 点击樱花散落特效组件（Client Component）
 * 
 * 在首页、随笔、文章、搜索页使用。
 * 点击页面任意位置时，从点击位置生成 16 片樱花花瓣，
 * 先向上弹起再飘落到屏幕底部，带旋转和左右摆动。
 * 
 * 实现方式：
 * - 监听 document click 事件
 * - 动态创建 img 元素（使用 /sakura-petal.svg）
 * - 通过 CSS 变量控制每片花瓣的随机参数（方向、旋转、速度等）
 * - 动画结束后自动移除 DOM 元素
 */
'use client'

import { useEffect } from 'react'
import './ClickSakuraFallEffect.css'

function ClickSakuraFallEffect() {
  useEffect(() => {
    const handleClick = (e) => {
      const count = 16

      for (let i = 0; i < count; i++) {
        const petal = document.createElement('img')
        petal.className = 'click-sakura-petal'
        petal.src = '/sakura-petal.svg'
        petal.alt = ''

        const size = Math.random() * 11 + 8
        const x = Math.random() * 260 - 130
        const popY = -(Math.random() * 60 + 25)
        const midX = x * 0.45 + (Math.random() * 80 - 40)
        const y = window.innerHeight - e.clientY + 70
        const rotateStart = Math.random() * 360
        const rotateEnd = rotateStart + (Math.random() * 720 + 360) * (Math.random() > 0.5 ? 1 : -1)
        const duration = Math.min(2.8, Math.max(1.2, y / 430 + Math.random() * 0.4))
        const delay = Math.random() * 0.12
        const opacity = Math.random() * 0.25 + 0.75

        petal.style.left = `${e.clientX}px`
        petal.style.top = `${e.clientY}px`
        petal.style.width = `${size}px`
        petal.style.height = `${size}px`
        petal.style.setProperty('--x', `${x}px`)
        petal.style.setProperty('--mid-x', `${midX}px`)
        petal.style.setProperty('--pop-y', `${popY}px`)
        petal.style.setProperty('--y', `${y}px`)
        petal.style.setProperty('--rotate-start', `${rotateStart}deg`)
        petal.style.setProperty('--rotate-end', `${rotateEnd}deg`)
        petal.style.setProperty('--duration', `${duration}s`)
        petal.style.setProperty('--delay', `${delay}s`)
        petal.style.setProperty('--opacity', opacity)

        document.body.appendChild(petal)
        petal.addEventListener('animationend', () => { petal.remove() }, { once: true })
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}

export default ClickSakuraFallEffect
