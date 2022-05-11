import Store from './Store.ts'
import type { Database, Collection } from "https://deno.land/x/mongo@v0.29.4/mod.ts";
import { SessionData } from '../Session.ts'

export default class MongoStore implements Store {
  db: Database
  sessions: Collection<any>

  constructor(db : Database, collectionName = 'sessions') {
    this.db = db
    this.sessions = db.collection(collectionName)
  }

  async sessionExists(sessionId : string) {
    const session = await this.sessions.findOne({ id: sessionId })

    return session ? true : false
  }

  async getSessionById(sessionId : string) {
    const session = await this.sessions.findOne({ id: sessionId })

    return session
  }

  createSession(sessionId : string, initialData : SessionData) {
    this.sessions.replaceOne(
      { id: sessionId },
      {
        id: sessionId,
        ...initialData
      },
      { upsert: true }
    )
  }

  deleteSession(sessionId : string) {
    this.sessions.deleteOne({ id: sessionId })
  }

  persistSessionData(sessionId : string, sessionData : SessionData) {
    this.sessions.replaceOne(
      { id: sessionId },
      {
        id: sessionId,
        ...sessionData
      },
      { upsert: true }
    )
  }
}