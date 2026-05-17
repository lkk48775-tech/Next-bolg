import GitHubProvider from "next-auth/providers/github"
import { HttpsProxyAgent } from "https-proxy-agent"
import https from "node:https"
import db from "@/lib/db"

const appEnv = process.env.APP_ENV || (process.env.NODE_ENV === "production" ? "production" : "local")
const isProductionEnv = appEnv === "production"

const authBaseUrl = isProductionEnv
  ? process.env.NEXTAUTH_URL_PRODUCTION || process.env.NEXTAUTH_URL || "https://ngmxlk.xyz"
  : process.env.NEXTAUTH_URL_LOCAL || process.env.NEXTAUTH_URL || "http://localhost:3000"

const githubClientId = isProductionEnv
  ? process.env.GITHUB_ID_PRODUCTION || process.env.GITHUB_ID
  : process.env.GITHUB_ID_LOCAL || process.env.GITHUB_ID

const githubClientSecret = isProductionEnv
  ? process.env.GITHUB_SECRET_PRODUCTION || process.env.GITHUB_SECRET
  : process.env.GITHUB_SECRET_LOCAL || process.env.GITHUB_SECRET

process.env.NEXTAUTH_URL = authBaseUrl

// 修复1：强制禁用自动代理检测，阿里云服务器不需要代理
const githubProxyUrl = ""
// 如果你以后确实需要代理，再手动设置GITHUB_OAUTH_PROXY环境变量

const githubHttpTimeout = Number(process.env.GITHUB_OAUTH_TIMEOUT) || 15000
const githubProxyAgent = githubProxyUrl ? new HttpsProxyAgent(githubProxyUrl) : undefined

const requestGithubJson = ({ url, method = "GET", headers = {}, body = null }) =>
  new Promise((resolve, reject) => {
    const payload = body ? body.toString() : null

    console.log(`[GitHub Request] ${method} ${url}`) // 添加调试日志

    const req = https.request(
      url,
      {
        method,
        agent: githubProxyAgent,
        timeout: githubHttpTimeout,
        headers: {
          Accept: "application/json",
          "User-Agent": "next-step-by-step-stable",
          ...headers,
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        const chunks = []

        res.on("data", (chunk) => chunks.push(chunk))
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8")
          console.log(`[GitHub Response] Status: ${res.statusCode}, Body: ${text.slice(0, 500)}`) // 添加调试日志

          let data = {}

          try {
            data = text ? JSON.parse(text) : {}
          } catch (e) {
            console.error(`[GitHub JSON Parse Error] ${e.message}, Raw text: ${text}`)
            reject(new Error(`GitHub returned a non-JSON response: ${text.slice(0, 200)}`))
            return
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            const errorMsg = data.error_description || data.message || `GitHub request failed: ${res.statusCode}`
            console.error(`[GitHub API Error] ${errorMsg}`)
            reject(new Error(errorMsg))
            return
          }

          resolve(data)
        })
      }
    )

    req.on("timeout", () => {
      const error = new Error(`GitHub request timed out after ${githubHttpTimeout}ms`)
      console.error(`[GitHub Timeout] ${error.message}`)
      req.destroy(error)
    })
    req.on("error", (error) => {
      console.error(`[GitHub Network Error] ${error.message}`)
      reject(error)
    })

    if (payload) {
      req.write(payload)
    }

    req.end()
  })

const githubProvider = GitHubProvider({
  clientId: githubClientId,
  clientSecret: githubClientSecret,
  httpOptions: {
    timeout: githubHttpTimeout,
  },
})

githubProvider.token = {
  url: "https://github.com/login/oauth/access_token",
  async request({ provider, params }) {
    // 修复2：强制使用正确的HTTPS回调地址，不依赖NextAuth.js自动生成
    const correctCallbackUrl = `${authBaseUrl}/api/auth/callback/github`
    console.log(`[OAuth Callback] Using URL: ${correctCallbackUrl}`)

    const body = new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code: params.code,
      redirect_uri: correctCallbackUrl, // 使用我们自己生成的正确地址
    })

    const tokens = await requestGithubJson({
      url: provider.token.url,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })

    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error)
    }

    return { tokens }
  },
}

githubProvider.userinfo = {
  ...githubProvider.userinfo,
  async request({ tokens }) {
    return requestGithubJson({
      url: "https://api.github.com/user",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })
  },
}

const getGithubUsername = ({ token, profile, user }) => {
  const candidates = [
    profile?.login,
    user?.name,
    token?.username,
    token?.name,
    token?.email,
    token?.sub ? `github_${token.sub}` : null,
  ]

  return candidates.find((value) => typeof value === "string" && value.trim())?.trim() || "github_user"
}

const buildGithubUserPayload = ({ token, account, profile, user }) => ({
  username: getGithubUsername({ token, profile, user }),
  avatar: profile?.avatar_url || user?.image || token?.picture || null,
  token: account?.access_token || token?.accessToken || null,
  githubId: token?.sub || account?.providerAccountId || null,
})

export const ensureUserRecord = async ({ token = {}, account = null, profile = null, user = null }) => {
  const payload = buildGithubUserPayload({ token, account, profile, user })

  await db.query(
    `
      INSERT INTO \`user\` (username, avatar, token)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        avatar = COALESCE(VALUES(avatar), avatar),
        token = COALESCE(VALUES(token), token)
    `,
    [payload.username, payload.avatar, payload.token]
  )

  const [rows] = await db.query(
    `
      SELECT id, username, avatar
      FROM \`user\`
      WHERE username = ?
      LIMIT 1
    `,
    [payload.username]
  )

  return rows[0] || null
}

export const authOptions = {
  debug: true, // 强制开启调试模式，生产环境也先开着，解决问题后再关闭
  providers: [githubProvider],
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn() {
      return true
    },
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "github") {
        token.accessToken = account.access_token || token.accessToken || null
        token.picture = profile?.avatar_url || user?.image || token.picture || null
        token.username = getGithubUsername({ token, profile, user })

        try {
          const dbUser = await ensureUserRecord({ token, account, profile, user })

          if (dbUser) {
            token.dbUserId = dbUser.id
            token.username = dbUser.username
            token.picture = dbUser.avatar || token.picture || null
          }
        } catch (error) {
          console.error("GitHub user sync failed during jwt callback:", error)
          token.dbUserId = token.dbUserId || null
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.dbUserId || null
        session.user.githubId = token.sub || null
        session.user.username = token.username || session.user.name || ""
        session.user.name = token.username || session.user.name || ""
        session.user.image = token.picture || session.user.image || null
      }

      return session
    },
  },
  events: {
    async signIn(message) {
      try {
        await ensureUserRecord({
          token: {
            sub: message.account?.providerAccountId || null,
            picture: message.user?.image || null,
            accessToken: message.account?.access_token || null,
            username: message.profile?.login || message.user?.name || null,
            name: message.user?.name || null,
            email: message.user?.email || null,
          },
          account: message.account,
          profile: message.profile,
          user: message.user,
        })
      } catch (error) {
        console.error("GitHub user sync failed during signIn event:", error)
      }
    },
  },
}