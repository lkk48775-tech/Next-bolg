import GitHubProvider from "next-auth/providers/github"
import { HttpsProxyAgent } from "https-proxy-agent"
import https from "node:https"
import db from "@/lib/db"

const githubProxyUrl = (
  process.env.GITHUB_OAUTH_PROXY ||
  process.env.HTTPS_PROXY ||
  process.env.HTTP_PROXY ||
  process.env.ALL_PROXY ||
  ""
).trim()

const githubHttpTimeout = Number(process.env.GITHUB_OAUTH_TIMEOUT) || 15000
const githubProxyAgent = githubProxyUrl ? new HttpsProxyAgent(githubProxyUrl) : undefined

const requestGithubJson = ({ url, method = "GET", headers = {}, body = null }) =>
  new Promise((resolve, reject) => {
    const payload = body ? body.toString() : null

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
          let data = {}

          try {
            data = text ? JSON.parse(text) : {}
          } catch {
            reject(new Error(`GitHub returned a non-JSON response: ${text.slice(0, 200)}`))
            return
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(data.error_description || data.message || `GitHub request failed: ${res.statusCode}`))
            return
          }

          resolve(data)
        })
      }
    )

    req.on("timeout", () => {
      req.destroy(new Error(`GitHub request timed out after ${githubHttpTimeout}ms`))
    })
    req.on("error", reject)

    if (payload) {
      req.write(payload)
    }

    req.end()
  })

const githubProvider = GitHubProvider({
  clientId: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  httpOptions: {
    timeout: githubHttpTimeout,
  },
})

githubProvider.token = {
  url: "https://github.com/login/oauth/access_token",
  async request({ provider, params }) {
    const body = new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code: params.code,
      redirect_uri: provider.callbackUrl,
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
  debug: process.env.NODE_ENV === "development",
  providers: [githubProvider],
  callbacks: {
    async signIn() {
      // 先允许 OAuth 登录成功，避免数据库写入异常直接打断回调流程。
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
