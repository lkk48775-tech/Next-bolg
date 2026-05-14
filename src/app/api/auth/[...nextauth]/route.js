import NextAuth from "next-auth";

import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,

      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  callbacks: {

    // JWT回调
    async jwt({ token, account }) {

      // GitHub登录成功时
      if (account) {

        // 保存 github access_token
        token.accessToken =
          account.access_token;
      }

      return token;
    },

    // session回调
    async session({ session, token }) {

      // 把token传给前端
      session.accessToken =
        token.accessToken;

      return session;
    },

  },
});
export { handler as GET, handler as POST };