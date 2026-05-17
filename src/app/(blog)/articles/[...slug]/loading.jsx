import styles from './ArticleDetail.module.css'

export default function ArticleDetailLoading() {
  return (
    <>
      <div className={styles.headers}></div>
      <div className={styles.picture}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(59, 130, 246, .18), rgba(244, 114, 182, .18), rgba(255, 255, 255, .3))',
          }}
        />
      </div>
      <div className={styles.articleShell}>
        <main className={styles.page}>
          <div className={styles.header}>
            <div className={styles.articleLoading}>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className={styles.articleFrame}>
            <div className={styles.articleLoading}>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
