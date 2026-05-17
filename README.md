This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
## GitHub OAuth 环境配置

项目会根据 `APP_ENV` 自动选择本地或线上 OAuth 配置：

```env
APP_ENV=local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_URL_LOCAL=http://localhost:3000
NEXTAUTH_URL_PRODUCTION=https://ngmxlk.xyz
```

本地开发时，GitHub OAuth App 的 `Authorization callback URL` 需要填写：

```txt
http://localhost:3000/api/auth/callback/github
```

线上部署时，`.env.production` 使用：

```env
APP_ENV=production
NEXTAUTH_URL=https://ngmxlk.xyz
NEXTAUTH_URL_LOCAL=http://localhost:3000
NEXTAUTH_URL_PRODUCTION=https://ngmxlk.xyz
```

对应的 GitHub OAuth App 回调地址是：

```txt
https://ngmxlk.xyz/api/auth/callback/github
```

推荐在 GitHub Developer settings 里创建两个 OAuth App：

- 本地 App：填 `http://localhost:3000/api/auth/callback/github`，把它的 `Client ID/Secret` 放到 `GITHUB_ID_LOCAL` 和 `GITHUB_SECRET_LOCAL`。
- 线上 App：填 `https://ngmxlk.xyz/api/auth/callback/github`，把它的 `Client ID/Secret` 放到 `GITHUB_ID_PRODUCTION` 和 `GITHUB_SECRET_PRODUCTION`。

如果只使用一个 GitHub OAuth App，它的回调地址必须和当前环境完全一致。`localhost` 和 `127.0.0.1` 在 GitHub OAuth 里是两个不同地址。
