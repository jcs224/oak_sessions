import { DB } from "https://deno.land/x/sqlite@v2.4.0/mod.ts";

export default class SqliteStore {
  private db: any

  constructor(path: string) {
    this.db = new DB(path)
    this.db.query("CREATE TABLE IF NOT EXISTS sessions (id TEXT, data TEXT)")
  }

  sessionExists(sessionId: string) {
    let session = ''
    
    for (const [sess] of this.db.query('SELECT data FROM sessions WHERE id = ?', [sessionId])) {
      session = sess
    }

    return session ? true : false;
  }

  getSessionById(sessionId: string) {
    let session = ''
    
    for (const [sess] of this.db.query('SELECT data FROM sessions WHERE id = ?', [sessionId])) {
      session = sess
    }

    return JSON.parse(session);
  }

  createSession(sessionId: string) {
    this.db.query('INSERT INTO sessions (id, data) VALUES (?, ?)', [sessionId, JSON.stringify({})]);
  }

  getSessionVariable(sessionId: string, variableKey: string) {
    const session = this.getSessionById(sessionId)
    return session[variableKey]
  }

  setSessionVariable(sessionId: string, variableKey: string, variableValue: string) {
    const session = this.getSessionById(sessionId);
		session[variableKey] = variableValue
		
		this.db.query('UPDATE sessions SET data = ? WHERE id = ?', [
      JSON.stringify(session), sessionId
    ]);
  }
}