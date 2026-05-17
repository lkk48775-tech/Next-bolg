'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const SakuraEffect = dynamic(() => import('../SakuraEffect'), { ssr: false })
const ParticleLineEffect = dynamic(() => import('../ParticleLineEffect'), { ssr: false })
const ClickSakuraFallEffect = dynamic(() => import('../ClickSakuraFallEffect'), { ssr: false })
const ClickRainEffect = dynamic(() => import('../ClickRainEffect'), { ssr: false })

const scheduleIdle = (callback) => {
  if (typeof window === 'undefined') return () => {}

  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: 1500 })
    return () => window.cancelIdleCallback(id)
  }

  const id = window.setTimeout(callback, 320)
  return () => window.clearTimeout(id)
}

export default function EffectManager() {
  const pathname = usePathname()
  const [canRenderEffects, setCanRenderEffects] = useState(false)

  useEffect(() => {
    setCanRenderEffects(false)
    const cancel = scheduleIdle(() => setCanRenderEffects(true))
    return cancel
  }, [pathname])

  if (!canRenderEffects) {
    return null
  }

  if (pathname === '/') {
    return (
      <>
        <SakuraEffect />
        <ClickSakuraFallEffect />
      </>
    )
  }

  if (pathname.startsWith('/TechnicalRoute')) {
    return (
      <>
        <ClickRainEffect />
        <ParticleLineEffect />
      </>
    )
  }

  if (pathname.startsWith('/Essay')) {
    return (
      <>
        <SakuraEffect />
        <ClickSakuraFallEffect />
      </>
    )
  }

  if (pathname === '/articles' || pathname.startsWith('/articles/')) {
    return (
      <>
        <SakuraEffect />
        <ClickSakuraFallEffect />
      </>
    )
  }

  if (pathname.startsWith('/FriendChain')) {
    return (
      <>
        <ClickRainEffect />
        <ParticleLineEffect />
      </>
    )
  }

  if (pathname.startsWith('/search')) {
    return (
      <>
        <SakuraEffect />
        <ClickSakuraFallEffect />
      </>
    )
  }

  return null
}
