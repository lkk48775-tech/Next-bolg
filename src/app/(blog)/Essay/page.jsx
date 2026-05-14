/**
 * 随笔页面（Server Component）
 * 
 * 服务端渲染随笔列表，每篇随笔包含封面图、标题、日期、描述和正文。
 * 只有底部的操作按钮（点赞、收藏、分享）拆分为客户端组件 EssayActions。
 */
import Image from 'next/image'
import styles from './essay.module.css'
import { essayList } from '@/data/essayData'
import heroBg from '@/assets/648557.webp'
import EssayActions from '@/components/EssayActions'

export default function EssayPage() {
  return (
    <>
      <div className={styles.hero}>
        <Image className={styles.heroImage} src={heroBg} alt="" priority fill sizes="100vw" style={{ objectFit: 'cover' }} />
        <div className={styles.heroText}>
          <h1>风的君王</h1>
          <p>向星辰下令，我要停泊瞩望，我让自己</p>
          <span>阿多尼斯</span>
        </div>
      </div>
      <div className={styles.main}>
        {essayList.map((essay) => (
          <article className={styles.card} key={essay.title}>
            <div className={styles.cover}>
              <Image src={essay.image} alt={essay.title} fill sizes="(max-width: 760px) 100vw, 45vw" style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.cardBody}>
              <span>{essay.date}</span>
              <h2>{essay.title}</h2>
              <p>{essay.desc}</p>
              <div className={styles.content}>
                {essay.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <EssayActions title={essay.title} desc={essay.desc} />
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
