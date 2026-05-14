/**
 * 页脚组件（Server Component）
 * 
 * 显示在博客前台大部分页面底部（随笔页除外）。
 * 包含诗句装饰、备案信息和免责声明。
 * 背景使用博客头图 + 渐变遮罩。
 * 
 * Props:
 * - hideImage: 是否隐藏背景图片（使用纯色渐变替代）
 */
import styles from './footer.module.css'

function Footer({ hideImage = false }) {
  return (
    <footer className={`${styles.footer} ${hideImage ? styles.noImage : ''}`}>
      <div className={styles.inner}>
        <p className={styles.poem}>冲天香阵透长安，满城尽带黄金甲</p>
        <p>本网站由 Sakura 强力支持 豫ICP备2026002723号</p>
        <p>本网站部分内容来源于网络，仅供大家学习与参考。</p>
        <p>本网站一切内容不代表本站立场，并不代表本站赞同其观点和对其真实性负责。</p>
        <p>如无意中侵犯了某个企业或个人的知识产权，请及时通过电子邮件(3514548927@qq.com)告知我们，本网站将立即给予删除。</p>
      </div>
    </footer>
  )
}

export default Footer
