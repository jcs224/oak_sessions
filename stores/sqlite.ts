import { IStore } from "./interface.ts";
import { DB } from "https://deno.land/x/sqlite@v2.4.0/mod.ts";

export default class SqliteStore implements IStore {
  private _sessionSqliteStore: any;
  private _path: string;

  constructor(options: any) {
    this._path = options.path;
  }

  public async init() {
    this._sessionSqliteStore = new DB(this._path);

    this._sessionSqliteStore.query(
      "CREATE TABLE IF NOT EXISTS sessions (id TEXT, data TEXT)",
    );

    await Promise.resolve()
  }

  public async sessionExists(sessionId: string) : Promise<boolean> {
    let sessionCount = 0;
    for (const [count] of await this._sessionSqliteStore.query('SELECT COUNT (id) FROM sessions WHERE id = ?', [sessionId])) {
      sessionCount = count;
    }

		if (sessionCount > 0) {
      return true;
		} else {
			return false;
		}
	}

  public async getSessionById(sessionId: string) : Promise<any> {
    let session = ''
    
    for (const [sess] of await this._sessionSqliteStore.query('SELECT data FROM sessions WHERE id = ?', [sessionId])) {
      session = sess
    }

    return JSON.parse(session);
	}

  public async createSession(sessionId: string) : Promise<void> {
		await this._sessionSqliteStore.query('INSERT INTO sessions (id, data) VALUES (?, ?)', [sessionId, JSON.stringify({})]);
	}

  public async setSessionVariable(sessionId: any, sessionVariableKey: any, sessionVariableValue: any) : Promise<void> {
		const session = await this.getSessionById(sessionId);
		session[sessionVariableKey] = sessionVariableValue
		
		this._sessionSqliteStore.query('UPDATE sessions SET data = ? WHERE id = ?', [
      JSON.stringify(session), sessionId
    ]);
	}

  public async deleteSession(sessionId: any) : Promise<void> {
		await this._sessionSqliteStore.query('DELETE FROM sessions WHERE id = ?', [sessionId]);
	}
}