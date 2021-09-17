import Store from './Store.ts'
import { Redis } from 'https://deno.land/x/redis@v0.24.0/mod.ts'

export default class RedisStore implements Store {
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
    const session = await this.db.get(this.keyPrefix + sessionId)

    if (session) {
      const sessionString : string = String(await this.db.get(this.keyPrefix + sessionId))
      const value = JSON.parse(sessionString)
      return value
    } else {
      return null
    }
  }

  async createSession(sessionId : string, initialData: Object) {
    await this.db.set(this.keyPrefix + sessionId, JSON.stringify(initialData))
  }

  async deleteSession(sessionId : string) {
    await this.db.del(this.keyPrefix + sessionId)
  }

  async persistSessionData(sessionId : string, sessionData : Object) {
    await this.db.set(this.keyPrefix + sessionId, JSON.stringify(sessionData))
  }
}
