import { Auth, createActionURL, type AuthConfig } from "@auth/core"

export async function getSession(request: Request, config: AuthConfig) {
  const parsedUrl = new URL(request.url)

  const url = createActionURL(
    "session",
    parsedUrl.protocol.replace(/:$/, ""),
    request.headers,
    process.env,
    config
  )
  const sessionRequest = new Request(url, {
    headers: { cookie: request.headers.get("cookie") ?? "" },
  })

  const resp = await Auth(sessionRequest, config)

  return resp.json()
}
