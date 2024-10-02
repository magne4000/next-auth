import { beforeEach, describe, expect, it, vi } from "vitest"
import supertest from "supertest"
import express from "express"

import CredentialsProvider from "@auth/core/providers/credentials"
import type { AuthConfig } from "@auth/core"
import {
  createMiddleware,
  type NodeMiddleware,
} from "@universal-middleware/express"
import authjsHandler from "../src/handler.js"
import { type Get } from "@universal-middleware/core"

export const authConfig = {
  secret: "secret",
  trustHost: true,
  providers: [
    CredentialsProvider({
      credentials: { username: { label: "Username" } },
      async authorize(credentials) {
        if (typeof credentials?.username === "string") {
          const { username: name } = credentials
          return { name: name, email: name.replace(" ", "") + "@example.com" }
        }
        return null
      },
    }),
  ],
} satisfies AuthConfig

describe("Middleware behaviour", () => {
  let app: express.Express
  let client: ReturnType<typeof supertest>
  let error: Error | null
  let ExpressAuth: Get<[AuthConfig], NodeMiddleware>

  beforeEach(() => {
    app = express()
    client = supertest(app)
    ExpressAuth = createMiddleware(authjsHandler)

    error = null

    app.use("/auth/*", ExpressAuth(authConfig))
    app.get("/*", (req, res, next) => {
      try {
        res.send("Hello World")
      } catch (err) {
        error = err
      }
    })
    app.use((err, req, res, next) => {
      error = err
      res.status(500).send("Something broke!")
    })
  })

  it("Should send response only once", async () => {
    const response = await client
      .get("/auth/session")
      .set("Accept", "application/json")

    expect(response.status).toBe(200)
    expect(error).toBe(null)
  })
})
