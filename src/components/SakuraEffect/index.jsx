/**
 * 樱花飘落特效组件（Client Component）
 * 
 * 在首页、随笔、文章、搜索页使用。
 * 使用 tsparticles 库创建全屏樱花飘落效果：
 * - 使用 /sakura-petal.svg 作为粒子图片
 * - 花瓣从上方飘落，带旋转、摆动和倾斜动画
 * - 每片花瓣的大小、速度、旋转方向都随机
 * - 不拦截鼠标事件（pointer-events: none）
 * 
 * 组件卸载时会销毁粒子实例，防止内存泄漏。
 */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadFull } from 'tsparticles'
import { loadImageShape } from '@tsparticles/shape-image'

function SakuraEffect() {
  const [init, setInit] = useState(false)
  const particlesContainerRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    initParticlesEngine(async (engine) => {
      await loadFull(engine)
      await loadImageShape(engine)
    }).then(() => {
      if (isMounted) setInit(true)
    })

    return () => {
      isMounted = false
      if (particlesContainerRef.current) {
        particlesContainerRef.current.destroy(true)
        particlesContainerRef.current = null
      }
    }
  }, [])

  const particlesLoaded = useCallback(async (container) => {
    particlesContainerRef.current = container
  }, [])

  const options = useMemo(() => ({
    fullScreen: { enable: true, zIndex: 9999 },
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      number: { value: 90, density: { enable: true, area: 900 } },
      shape: {
        type: 'image',
        options: { image: { src: '/sakura-petal.svg', width: 64, height: 64 } }
      },
      opacity: { value: { min: 0.75, max: 1 } },
      size: { value: { min: 2, max: 15 } },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: 5, max: 10 },
        straight: false,
        random: true,
        outModes: { default: 'out' }
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: { enable: true, speed: { min: 25, max: 60 }, sync: false }
      },
      wobble: { enable: true, distance: 40, speed: { min: -12, max: 12 } },
      tilt: {
        enable: true,
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: { enable: true, speed: { min: 15, max: 35 }, sync: false }
      }
    },
    detectRetina: true
  }), [])

  if (!init) return null

  return (
    <Particles
      id="sakura-effect"
      options={options}
      particlesLoaded={particlesLoaded}
      style={{ pointerEvents: 'none' }}
    />
  )
}

export default SakuraEffect
