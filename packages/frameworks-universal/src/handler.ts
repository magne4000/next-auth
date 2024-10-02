import { Auth, type AuthConfig } from "@auth/core"
import type { Get, UniversalHandler } from "@universal-middleware/core"

const authjsHandler = ((config: AuthConfig) => async (request) => {
  return Auth(request, config)
}) satisfies Get<[config: AuthConfig], UniversalHandler>

export default authjsHandler
