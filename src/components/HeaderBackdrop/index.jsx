'use client'

import { useBlogContext } from '@/context/BlogContext'
import styles from './HeaderBackdrop.module.css'

export default function HeaderBackdrop() {
  const { scrollTop = 0 } = useBlogContext()

  return (
    <div className={`${styles.headers} ${scrollTop > 270 ? styles.hiddenHeaders : ''}`}></div>
  )
}
