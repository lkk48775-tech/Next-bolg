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
import Particles from '@tsparticles/react'
import { initTsParticlesEngine } from '@/lib/tsparticlesEngine'

function SakuraEffect() {
  const [init, setInit] = useState(false)
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)
  const [isTinyScreen, setIsTinyScreen] = useState(false)
  const particlesContainerRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobileQuery = window.matchMedia('(max-width: 768px)')
    const tinyScreenQuery = window.matchMedia('(max-width: 360px)')
    const updateMode = () => {
      const tinyScreen = tinyScreenQuery.matches
      setIsTinyScreen(tinyScreen)
      setIsLowPowerMode(mediaQuery.matches || mobileQuery.matches || tinyScreen)
    }

    updateMode()
    mediaQuery.addEventListener?.('change', updateMode)
    mobileQuery.addEventListener?.('change', updateMode)
    tinyScreenQuery.addEventListener?.('change', updateMode)

    initTsParticlesEngine().then(() => {
      if (isMounted) setInit(true)
    })

    return () => {
      isMounted = false
      if (particlesContainerRef.current) {
        particlesContainerRef.current.destroy(true)
        particlesContainerRef.current = null
      }
      mediaQuery.removeEventListener?.('change', updateMode)
      mobileQuery.removeEventListener?.('change', updateMode)
      tinyScreenQuery.removeEventListener?.('change', updateMode)
    }
  }, [])

  const particlesLoaded = useCallback(async (container) => {
    particlesContainerRef.current = container
  }, [])

  const options = useMemo(() => ({
    fullScreen: { enable: true, zIndex: 10002 },
    background: { color: { value: 'transparent' } },
    fpsLimit: isTinyScreen ? 20 : isLowPowerMode ? 30 : 60,
    particles: {
      number: { value: isTinyScreen ? 12 : isLowPowerMode ? 36 : 96, density: { enable: true, area: isTinyScreen ? 1800 : isLowPowerMode ? 1500 : 1050 } },
      shape: {
        type: 'image',
        options: { image: { src: '/sakura-petal.svg', width: 64, height: 64 } }
      },
      opacity: {
        value: { min: 0.68, max: 0.96 },
        animation: { enable: true, speed: 0.25, minimumValue: 0.55, sync: false }
      },
      size: { value: { min: 3, max: isTinyScreen ? 7 : isLowPowerMode ? 10 : 16 } },
      move: {
        enable: true,
        direction: 'bottom',
        speed: { min: isTinyScreen ? 1.6 : isLowPowerMode ? 2.4 : 3.6, max: isTinyScreen ? 3.2 : isLowPowerMode ? 5.2 : 7.8 },
        straight: false,
        random: true,
        outModes: { default: 'out' }
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: { enable: true, speed: { min: isTinyScreen ? 6 : isLowPowerMode ? 12 : 22, max: isTinyScreen ? 14 : isLowPowerMode ? 26 : 48 }, sync: false }
      },
      wobble: { enable: true, distance: isTinyScreen ? 10 : isLowPowerMode ? 22 : 44, speed: { min: isTinyScreen ? -2 : isLowPowerMode ? -5 : -9, max: isTinyScreen ? 2 : isLowPowerMode ? 5 : 9 } },
      tilt: {
        enable: true,
        value: { min: 0, max: 360 },
        direction: 'random',
        animation: { enable: true, speed: { min: isTinyScreen ? 4 : isLowPowerMode ? 8 : 14, max: isTinyScreen ? 10 : isLowPowerMode ? 18 : 32 }, sync: false }
      }
    },
    detectRetina: !isTinyScreen
  }), [isLowPowerMode, isTinyScreen])

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
