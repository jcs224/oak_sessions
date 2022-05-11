import Store from './Store.ts'
import type { Database, Collection } from "https://deno.land/x/mongo@v0.29.4/mod.ts";
import type { SessionData } from '../Session.ts'

interface MongoSession {
  id: string,
  data: SessionData   
}

export default class MongoStore implements Store {
  db: Database
  sessions: Collection<MongoSession>

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

    return session ? session.data : null
  }

  createSession(sessionId : string, initialData : SessionData) {
    this.sessions.replaceOne(
      { id: sessionId },
      {
        id: sessionId,
        data: initialData
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
        data: sessionData
      },
      { upsert: true }
    )
  }
}