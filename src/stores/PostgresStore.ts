import Store from './Store.ts'
import { SessionData } from '../Session.ts'

export default class PostgresStore implements Store {
  sql: any
  tableName: string

  constructor(sql: any, tableName = 'sessions') {
    this.sql = sql
    this.tableName = tableName
  }

  async initSessionsTable() {
    await this.sql`create table if not exists ${this.sql(this.tableName)} (id string not null primary key, data string)`;
  }

  async sessionExists(sessionId: string) {
    let result = await this.sql`select data from ${this.sql(this.tableName)} where id = ${sessionId}`
    return result.length > 0 ? true : false
  }

  async getSessionById(sessionId: string) {
    let result = await this.sql`select data from ${this.sql(this.tableName)} where id = ${sessionId}`
    return result.length > 0 ? JSON.parse(result[0].data) as SessionData : null
  }

  async createSession(sessionId : string, initialData : SessionData) {
    await this.sql`insert into ${this.sql(this.tableName)} (id, data) values (${sessionId}, ${JSON.stringify(initialData)})`
  }

  async deleteSession(sessionId: string) {
    await this.sql`delete from ${this.sql(this.tableName)} where id = ${sessionId}`
  }

  async persistSessionData(sessionId : string, sessionData : SessionData) {
    await this.sql`update ${this.sql(this.tableName)} set data = ${JSON.stringify(sessionData)} where id = ${sessionId}`
  }
}