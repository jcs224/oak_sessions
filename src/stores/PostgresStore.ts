import Store from './Store.ts'
import { SessionData } from '../Session.ts'
import type postgres from "https://deno.land/x/postgresjs@v3.2.4/mod.js";

// deno-lint-ignore ban-types
type SQLExecutor = postgres.Sql<{}>;

export default class PostgresStore implements Store {
  sql: SQLExecutor
  tableName: string

  constructor(sql: SQLExecutor, tableName = 'sessions') {
    this.sql = sql
    this.tableName = tableName
  }

  async initSessionsTable() {
    await this.sql`create table if not exists ${this.sql(this.tableName)} (id varchar(21) not null primary key, data varchar)`;
  }

  async sessionExists(sessionId: string) {
    const result = await this.sql`select data from ${this.sql(this.tableName)} where id = ${sessionId}`
    return result.length > 0 ? true : false
  }

  async getSessionById(sessionId: string) {
    const result = await this.sql`select data from ${this.sql(this.tableName)} where id = ${sessionId}`
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
