import { type AuthConfig } from "@auth/core"
import type { Get, UniversalMiddleware } from "@universal-middleware/core"
import { getSession } from "./lib/session.js"

const authjsSessionMiddleware: Get<[config: AuthConfig], UniversalMiddleware> =
  (config) => async (request, context) => {
    try {
      return {
        ...context,
        session: await getSession(request.headers, config),
      }
    } catch (error) {
      console.debug("authjsSessionMiddleware:", error)
      return {
        ...context,
        session: null,
      }
    }
  }

export default authjsSessionMiddleware
