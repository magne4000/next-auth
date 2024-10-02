import { vi, describe, it, beforeEach, expect } from "vitest"
import supertest from "supertest"
import express from "express"
import { createRequestAdapter } from "@universal-middleware/express"

const sessionJson = {
  user: {
    name: "John Doe",
    email: "test@example.com",
    image: "",
    id: "1234",
  },
  expires: "",
}

vi.mock("@auth/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@auth/core")>()
  return {
    ...mod,
    Auth: vi.fn((request, config) => {
      return new Response(JSON.stringify(sessionJson), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }),
  }
})

// dynamic import to avoid loading Auth before hoisting
const { getSession } = await import("../src/lib/session.js")

describe("getSession", () => {
  let app: express.Express
  let client: ReturnType<typeof supertest>
  let requestAdapter: ReturnType<typeof createRequestAdapter>

  beforeEach(() => {
    app = express()
    client = supertest(app)
    requestAdapter = createRequestAdapter()
  })

  it("Should return the mocked session from the Auth response", async () => {
    let expectations: Function = () => {}

    app.post("/", async (req, res) => {
      const session = await getSession(requestAdapter(req), {
        providers: [],
        secret: "secret",
      })

      expectations = async () => {
        expect(session).toEqual(sessionJson)
      }

      res.send("OK")
    })

    await client
      .post("/")
      .set("X-Test-Header", "foo")
      .set("Accept", "application/json")

    await expectations()
  })
})
