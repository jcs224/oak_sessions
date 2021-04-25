import { connect } from 'https://deno.land/x/redis@v0.22.0/mod.ts'

export default class RedisStore {
  private host: string
  private port: number
  private db: any
  private keyPrefix: string

  constructor(options?: any) {
    this.host = options.host
    this.port = options.port
    this.keyPrefix = 'session_'
  }

  async init() {
    this.db = await connect({
      hostname: this.host,
      port: this.port
    })
  }

  async sessionExists(sessionId: string) {
    const session = await this.db.get(this.keyPrefix + sessionId)
    return session ? true : false
  }

  async getSessionById(sessionId: string) {
    const value = JSON.parse(await this.db.get(this.keyPrefix + sessionId))
    return value
  }

  async createSession(sessionId: string) {
    await this.db.set(this.keyPrefix + sessionId, JSON.stringify({}))
  }

  async getSessionVariable(sessionId: string, variableKey: string) {
    const session = await this.getSessionById(sessionId)
    return session[variableKey]
  }

  async setSessionVariable(sessionId: string, variableKey: string, variableValue: string) {
    const session = await this.getSessionById(sessionId)
    session[variableKey] = variableValue

    await this.db.set(this.keyPrefix + sessionId, JSON.stringify(session))
  }
}