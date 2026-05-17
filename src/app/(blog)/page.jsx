import Image from 'next/image'
import homeHeader from '@/assets/home-header-lite.webp'
import styles from './Home.module.css'
import HomePagination from '@/components/HomePagination'
import { getHomeSectionsPage } from '@/lib/homeSections'

export default async function Home() {
  const homeSectionsPage = await getHomeSectionsPage(1)

  return (
    <>
      <div className={styles.header}>
        <Image
          className={styles.headerImage}
          src={homeHeader}
          alt=""
          priority
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className={styles.headerText}>
          <span>愿每一次敲下代码，都离理想中的自己更近一点。</span>
        </div>
        <div className={styles.bannerWare1}></div>
        <div className={styles.bannerWare2}></div>
      </div>

      <div className={styles.main}>
        <div className={styles.right}>
          <div className={styles.textK}>
            <div className={styles.icons}>
              <svg className={styles.icon} aria-hidden="true">
                <use href="#icon-fenlei1"></use>
              </svg>
            </div>
            <span>欢迎访问：http://60.205.242.169</span>
          </div>

          <HomePagination
            initialSections={homeSectionsPage.sections}
            initialPage={homeSectionsPage.page}
            initialPageCount={homeSectionsPage.pageCount}
          />
        </div>
      </div>
    </>
  )
}
