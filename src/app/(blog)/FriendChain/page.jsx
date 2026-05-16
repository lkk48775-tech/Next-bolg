/**
 * 友链页面（Server Component）
 * 
 * 纯服务端渲染，零客户端 JS。
 * 展示友情链接列表、交换说明和本站信息。
 * 顶部有固定的半透明遮罩条。
 */
import styles from './FriendChain.module.css'

const friendLinks = [
  {
    name: 'MyView Blog',
    url: 'http://blog.myview.top/',
    desc: '一个个人博客，记录前端知识、项目实践和算法学习。',
    avatar: 'M',
    tags: ['前端', '项目', '算法'],
  },
  {
    name: 'Next.js',
    url: 'https://nextjs.org/',
    desc: 'React 全栈框架官网，提供 App Router、服务端渲染和部署等官方文档。',
    avatar: 'N',
    tags: ['Next.js', 'React', '文档'],
  },
]

const siteInfo = [
  ['站点名称', 'Sakura'],
  ['站点地址', 'https://sakura.example.com'],
  ['站点描述', '记录前端、算法和项目实践'],
  ['头像地址', '/avatar.webp']
]

export default function FriendChainPage() {
  return (
    <>
      <div className={styles.headers}></div>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Friends</span>
            <h1>友链</h1>
            <p>一些认真生活、认真写作的人。欢迎常来看看，也欢迎交换链接。</p>
          </div>
          <a className={styles.applyButton} href="#apply">申请友链</a>
        </section>

        <section className={styles.linkGrid} aria-label="友链列表">
          {friendLinks.map((friend) => (
            <a className={styles.friendCard} href={friend.url} key={friend.name} target="_blank" rel="noreferrer">
              <div className={styles.avatar}>{friend.avatar}</div>
              <div className={styles.friendMain}>
                <div className={styles.friendHeader}>
                  <h2>{friend.name}</h2>
                  <span>访问</span>
                </div>
                <p>{friend.desc}</p>
                <div className={styles.tags}>
                  {friend.tags.map((tag) => (<span key={`${friend.name}-${tag}`}>{tag}</span>))}
                </div>
              </div>
            </a>
          ))}
        </section>

        <section className={styles.applySection} id="apply">
          <div className={styles.applyCard}>
            <span className={styles.sectionLabel}>Apply</span>
            <h2>交换说明</h2>
            <ul>
              <li>站点内容健康，能正常访问。</li>
              <li>建议是个人博客、作品集或技术笔记站。</li>
              <li>添加本站后，可以通过评论区留下你的站点信息。</li>
            </ul>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.sectionLabel}>My Site</span>
            <h2>本站信息</h2>
            <dl>
              {siteInfo.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </>
  )
}
