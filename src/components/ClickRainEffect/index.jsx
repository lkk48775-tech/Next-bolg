/**
 * 点击彩色雨点特效组件（Client Component）
 * 
 * 在归档页和友链页使用。
 * 点击页面任意位置时，从点击位置生成 22 个彩色圆点，
 * 先向上弹起再向下落到屏幕底部，模拟雨滴散落效果。
 * 
 * 实现方式：
 * - 监听 document click 事件
 * - 动态创建 span 元素，通过 CSS 变量控制动画参数
 * - 动画结束后自动移除 DOM 元素
 */
'use client'

import { useEffect } from 'react'
import './ClickRainEffect.css'

function ClickRainEffect() {
  useEffect(() => {
    const colors = [
      '#ff5fa0', '#ff8fc0', '#ffc2d8', '#7dd3fc',
      '#86efac', '#facc15', '#c084fc', '#fb7185'
    ]

    const handleClick = (e) => {
      const count = 22

      for (let i = 0; i < count; i++) {
        const dot = document.createElement('span')
        dot.className = 'click-rain-dot'

        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = Math.random() * 3 + 2
        const x = Math.random() * 180 - 90
        const y = window.innerHeight - e.clientY + 30
        const duration = Math.min(1, Math.max(0.8, y / 500))
        const delay = Math.random() * 0.08

        dot.style.left = `${e.clientX}px`
        dot.style.top = `${e.clientY}px`
        dot.style.width = `${size}px`
        dot.style.height = `${size}px`
        dot.style.backgroundColor = color
        dot.style.setProperty('--x', `${x}px`)
        dot.style.setProperty('--y', `${y}px`)
        dot.style.setProperty('--duration', `${duration}s`)
        dot.style.setProperty('--delay', `${delay}s`)

        document.body.appendChild(dot)
        dot.addEventListener('animationend', () => { dot.remove() })
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}

export default ClickRainEffect
