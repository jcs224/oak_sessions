import { DB } from "https://deno.land/x/sqlite@v2.4.0/mod.ts";

export default class SqliteStore {
  constructor(db, tableName = 'sessions') {
    this.db = db
    this.tableName = tableName
    this.db.query(`CREATE TABLE IF NOT EXISTS ${this.tableName} (id TEXT, data TEXT)`)
  }

  sessionExists(sessionId) {
    let session = ''
    
    for (const [sess] of this.db.query(`SELECT data FROM ${this.tableName} WHERE id = ?`, [sessionId])) {
      session = sess
    }

    return session ? true : false;
  }

  getSessionById(sessionId) {
    let session = ''
    
    for (const [sess] of this.db.query(`SELECT data FROM ${this.tableName} WHERE id = ?`, [sessionId])) {
      session = sess
    }

    return JSON.parse(session);
  }

  createSession(sessionId) {
    this.db.query(`INSERT INTO ${this.tableName} (id, data) VALUES (?, ?)`, [sessionId, JSON.stringify({
      '_flash': {}
    })]);
  }

  deleteSession(sessionId) {
    this.db.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [sessionId])
  }

  persistSessionData(sessionId, sessionData) {
    this.db.query(`UPDATE ${this.tableName} SET data = ? WHERE id = ?`, [
      JSON.stringify(sessionData), sessionId
    ]);
  }
}