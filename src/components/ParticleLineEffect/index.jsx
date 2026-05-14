/**
 * 粒子连线特效组件（Client Component）
 * 
 * 在归档页和友链页使用。
 * 使用 tsparticles 库创建全屏粒子连线效果：
 * - 粉色粒子在屏幕中自由移动
 * - 粒子之间距离小于 100px 时自动连线
 * - 鼠标悬浮时附近粒子与鼠标产生连线（grab 模式）
 * - 鼠标点击时附近粒子向外散开（repulse 模式）
 * - 粒子碰到边界会反弹
 * 
 * 组件卸载时会销毁粒子实例，防止内存泄漏。
 */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadFull } from 'tsparticles'

function ParticleLineEffect() {
  const [init, setInit] = useState(false)
  const particlesRef = useRef(null)

  useEffect(() => {
    let mounted = true

    initParticlesEngine(async (engine) => {
      await loadFull(engine)
    }).then(() => {
      if (mounted) setInit(true)
    })

    return () => {
      mounted = false
      if (particlesRef.current) {
        particlesRef.current.destroy(true)
        particlesRef.current = null
      }
    }
  }, [])

  const particlesLoaded = useCallback(async (container) => {
    particlesRef.current = container
  }, [])

  const options = useMemo(() => ({
    fullScreen: { enable: true, zIndex: 9997 },
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    interactivity: {
      detectsOn: 'window',
      events: {
        onHover: { enable: true, mode: 'grab' },
        onClick: { enable: true, mode: 'repulse' },
        resize: { enable: true }
      },
      modes: {
        grab: { distance: 150, links: { opacity: 0.6 } },
        repulse: { distance: 270, duration: 0.6 }
      }
    },
    particles: {
      number: { value: 85, density: { enable: true, area: 900 } },
      color: { value: '#ff8fc0' },
      opacity: { value: { min: 0.45, max: 0.7 } },
      size: { value: { min: 1, max: 3 } },
      links: { enable: true, distance: 100, color: '#ff9ac8', opacity: 0.35, width: 1 },
      move: {
        enable: true,
        speed: 0.8,
        direction: 'none',
        random: false,
        straight: false,
        outModes: { default: 'bounce' }
      }
    },
    detectRetina: true
  }), [])

  if (!init) return null

  return (
    <Particles
      id="particle-line-effect"
      options={options}
      particlesLoaded={particlesLoaded}
      style={{ pointerEvents: 'none' }}
    />
  )
}

export default ParticleLineEffect
