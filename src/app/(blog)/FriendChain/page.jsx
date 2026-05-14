/**
 * 友链页面（Server Component）
 * 
 * 纯服务端渲染，零客户端 JS。
 * 展示友情链接列表、交换说明和本站信息。
 * 顶部有固定的半透明遮罩条。
 */
import styles from './FriendChain.module.css'

const friendLinks = [
  { name: 'Nclxl Blog', url: 'https://example.com', desc: '记录前端、生活和项目实践的个人空间。', avatar: 'N', tags: ['前端', 'React'] },
  { name: 'Blue Sakura', url: 'https://example.com', desc: '喜欢动画、设计和温柔交互的独立博客。', avatar: 'B', tags: ['设计', '生活'] },
  { name: 'Code Garden', url: 'https://example.com', desc: '把复杂问题拆成清晰笔记，慢慢种一座代码花园。', avatar: 'C', tags: ['JavaScript', '笔记'] },
  { name: 'Tiny Lab', url: 'https://example.com', desc: '实验一些有趣的小工具，也分享踩坑和复盘。', avatar: 'T', tags: ['工具', '实验'] },
  { name: 'Moonlit Dev', url: 'https://example.com', desc: '夜里写代码，白天整理文章，持续输出技术内容。', avatar: 'M', tags: ['Vue', '工程化'] },
  { name: 'Frontend Notes', url: 'https://example.com', desc: '聚焦 CSS、浏览器和性能优化的前端笔记站。', avatar: 'F', tags: ['CSS', '性能'] }
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
