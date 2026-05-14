/**
 * 特效管理器组件（Client Component）
 * 
 * 根据当前路由路径，决定显示哪些页面特效：
 * - 首页、随笔、文章、搜索：樱花飘落 + 点击樱花散落
 * - 归档、友链：点击彩色雨点 + 粒子连线
 * 
 * 所有特效组件都通过 next/dynamic 懒加载 + ssr: false，
 * 不会阻塞页面首次渲染，也不会在服务端执行。
 */
'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

// 懒加载特效组件，禁用 SSR（这些组件依赖 DOM/Canvas）
const SakuraEffect = dynamic(() => import('../SakuraEffect'), { ssr: false })
const ParticleLineEffect = dynamic(() => import('../ParticleLineEffect'), { ssr: false })
const ClickSakuraFallEffect = dynamic(() => import('../ClickSakuraFallEffect'), { ssr: false })
const ClickRainEffect = dynamic(() => import('../ClickRainEffect'), { ssr: false })

function EffectManager() {
  const pathname = usePathname()

  // 首页：樱花飘落 + 点击散落
  if (pathname === '/') {
    return (
      <>
        <SakuraEffect />
        <ClickSakuraFallEffect />
      </>
    )
  }

  // 归档页：彩色雨点 + 粒子连线
  if (pathname.startsWith('/TechnicalRoute')) {
    return (
      <>
        <ClickRainEffect />
        <ParticleLineEffect />
      </>
    )
  }

  // 随笔页：樱花飘落 + 点击散落
  if (pathname.startsWith('/Essay')) {
    return (
      <>
        <SakuraEffect />
        <ClickSakuraFallEffect />
      </>
    )
  }

  // 文章页：樱花飘落 + 点击散落
  if (pathname === '/articles' || pathname.startsWith('/articles/')) {
    return (
      <>
        <SakuraEffect />
        <ClickSakuraFallEffect />
      </>
    )
  }

  // 友链页：彩色雨点 + 粒子连线
  if (pathname.startsWith('/FriendChain')) {
    return (
      <>
        <ClickRainEffect />
        <ParticleLineEffect />
      </>
    )
  }

  // 搜索页：樱花飘落 + 点击散落
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

export default EffectManager
