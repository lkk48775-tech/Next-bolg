import { getServerSession } from "next-auth"
import { authOptions, ensureUserRecord } from "@/lib/auth"

export const getCurrentDbUser = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user?.username && !session?.user?.name) {
    return null
  }

  if (session?.user?.id) {
    return { id: session.user.id, session }
  }

  const dbUser = await ensureUserRecord({
    token: {
      sub: session?.user?.githubId || null,
      picture: session?.user?.image || null,
      username: session?.user?.username || session?.user?.name || null,
      name: session?.user?.name || null,
    },
  })

  return dbUser?.id ? { ...dbUser, session } : null
}
