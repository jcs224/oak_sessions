import { connect } from 'https://deno.land/x/redis@v0.22.2/mod.ts'

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
    await this.db.set(this.keyPrefix + sessionId, JSON.stringify({
      '_flash': {}
    }))
  }

  async persistSessionData(sessionId, sessionData) {
    await this.db.set(this.keyPrefix + sessionId, JSON.stringify(sessionData))
  }
}