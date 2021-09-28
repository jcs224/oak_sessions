import { DB } from "https://deno.land/x/sqlite@v2.4.0/mod.ts";
import Store from './Store.ts'
import { SessionData } from '../Session.ts'

export default class SqliteStore implements Store {
  db: DB
  tableName: string

  constructor(db : DB, tableName = 'sessions') {
    this.db = db
    this.tableName = tableName
    this.db.query(`CREATE TABLE IF NOT EXISTS ${this.tableName} (id TEXT, data TEXT)`)
  }

  sessionExists(sessionId : string) {
    let session = ''
    
    for (const [sess] of this.db.query(`SELECT data FROM ${this.tableName} WHERE id = ?`, [sessionId])) {
      session = sess
    }

    return session ? true : false;
  }

  getSessionById(sessionId : string) {
    let session = ''
    
    for (const [sess] of this.db.query(`SELECT data FROM ${this.tableName} WHERE id = ?`, [sessionId])) {
      session = sess
    }

    return session ? JSON.parse(session) as SessionData : null;
  }

  createSession(sessionId : string, initialData : SessionData) {
    this.db.query(`INSERT INTO ${this.tableName} (id, data) VALUES (?, ?)`, [sessionId, JSON.stringify(initialData)]);
  }

  deleteSession(sessionId : string) {
    this.db.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [sessionId])
  }

  persistSessionData(sessionId : string, sessionData : SessionData) {
    this.db.query(`UPDATE ${this.tableName} SET data = ? WHERE id = ?`, [
      JSON.stringify(sessionData), sessionId
    ]);
  }
}