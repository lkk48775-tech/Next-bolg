/**
 * 归档页面
 *
 * 左侧个人简介，右侧文章归档时间线（从后端获取数据）。
 */
import styles from './TechnicalRoute.module.css'
import ArchiveShell from '@/components/ArchiveShell'
import ArchiveTimeline from './ArchiveTimeline'
import HeaderBackdrop from '@/components/HeaderBackdrop'
import { getArchiveArticles } from '@/lib/archiveArticles'

export const revalidate = 300

export default async function TechnicalRoutePage() {
  const articles = await getArchiveArticles()

  return (
    <>
      <HeaderBackdrop />
      <ArchiveShell>
        <aside className={styles.profile}>
          <div className={styles.profileInner}>
            <div className={styles.avatarSprite} aria-label="Erii 动画头像"></div>
            <div className={styles.profileText}>
              <h1>Skaura</h1>
              <p>记录前端、算法和项目实践</p>
            </div>
          </div>
        </aside>

        <ArchiveTimeline articles={articles} />
      </ArchiveShell>
    </>
  )
}
