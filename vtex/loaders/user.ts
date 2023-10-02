import { AppContext } from "../mod.ts"
import { parseCookie } from "../utils/vtexId.ts"

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  profilePicture?: string
  gender?: string
}

async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext
): Promise<User | null> {
  const { io } = ctx
  const { cookie, payload } = parseCookie(req.headers, ctx.account)

  if (!payload?.sub || !payload?.userId) {
    return null
  }

  const query =
    "query getUserProfile { profile { id email firstName lastName profilePicture gender }}"

  try {
    const user = await io.query({ query }, { headers: { cookie } })
    return { ...user.profile } as User
  } catch (_) {
    return null
  }
}

export default loader
