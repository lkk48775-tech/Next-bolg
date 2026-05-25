'use client'

import dynamic from 'next/dynamic'

const SakuraEffect = dynamic(() => import('../SakuraEffect'), { ssr: false })
const ClickSakuraFallEffect = dynamic(() => import('../ClickSakuraFallEffect'), { ssr: false })

export default function EffectManager() {
  return (
    <>
      <SakuraEffect />
      <ClickSakuraFallEffect />
    </>
  )
}
