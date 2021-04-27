import { connect } from 'https://deno.land/x/redis@v0.22.0/mod.ts'

export default class RedisStore {
  constructor(options) {
    this.host = options.host
    this.port = options.port
    this.keyPrefix = 'session_'
    this.db = null
  }

  async init() {
    this.db = await connect({
      hostname: this.host,
      port: this.port
    })
  }

  async sessionExists(sessionId) {
    const session = await this.db.get(this.keyPrefix + sessionId)
    return session ? true : false
  }

  async getSessionById(sessionId) {
    const value = JSON.parse(await this.db.get(this.keyPrefix + sessionId))
    return value
  }

  async createSession(sessionId) {
    await this.db.set(this.keyPrefix + sessionId, JSON.stringify({}))
  }

  async getSessionVariable(sessionId, variableKey) {
    const session = await this.getSessionById(sessionId)
    return session[variableKey]
  }

  async setSessionVariable(sessionId, variableKey, variableValue) {
    const session = await this.getSessionById(sessionId)
    session[variableKey] = variableValue

    await this.db.set(this.keyPrefix + sessionId, JSON.stringify(session))
  }
}