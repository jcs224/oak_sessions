import Store from './Store.ts'
import { Redis, Bulk } from 'https://deno.land/x/redis@v0.22.2/mod.ts'

export default class RedisStore implements Store{
  keyPrefix : string
  db : Redis

  constructor(db : Redis, keyPrefix = 'session_') {
    this.keyPrefix = keyPrefix
    this.db = db
  }

  async sessionExists(sessionId : string) {
    const session = await this.db.get(this.keyPrefix + sessionId)
    return session ? true : false
  }

  async getSessionById(sessionId : string) {
    const sessionString : string = String(await this.db.get(this.keyPrefix + sessionId))
    const value = JSON.parse(sessionString)
    return value
  }

  async createSession(sessionId : string) {
    await this.db.set(this.keyPrefix + sessionId, JSON.stringify({
      '_flash': {}
    }))
  }

  async deleteSession(sessionId : string) {
    await this.db.del(this.keyPrefix + sessionId)
  }

  async persistSessionData(sessionId : string, sessionData : Object) {
    await this.db.set(this.keyPrefix + sessionId, JSON.stringify(sessionData))
  }
}