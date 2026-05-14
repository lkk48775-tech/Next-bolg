import styles from './login.module.css'

export default function LoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.card}>
        <h1>Sakura Admin</h1>
        <p>登录管理后台</p>
        <form className={styles.form}>
          <input type="text" placeholder="请输入用户名" autoComplete="username" />
          <input type="password" placeholder="请输入密码" autoComplete="current-password" />
          <button type="submit">登录</button>
        </form>
      </div>
    </div>
  )
}
