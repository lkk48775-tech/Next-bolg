'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HoverPrefetchLink({
  href,
  onMouseEnter,
  onFocus,
  children,
  ...props
}) {
  const [prefetchEnabled, setPrefetchEnabled] = useState(false)

  const enablePrefetch = () => {
    setPrefetchEnabled(true)
  }

  return (
    <Link
      {...props}
      href={href}
      prefetch={prefetchEnabled ? undefined : false}
      onMouseEnter={(event) => {
        enablePrefetch()
        onMouseEnter?.(event)
      }}
      onFocus={(event) => {
        enablePrefetch()
        onFocus?.(event)
      }}
    >
      {children}
    </Link>
  )
}
