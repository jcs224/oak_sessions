import { CookieStore, MemoryStore, PostgresStore, RedisStore, SqliteStore, Store, WebdisStore } from "../mod.ts";
import { connect as connectRedis } from "https://deno.land/x/redis@v0.25.5/mod.ts"
import { DB as sqliteDB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts"
import postgres from "https://deno.land/x/postgresjs@v3.1.0/mod.js"

export async function makeStore(): Promise<Store> {
  switch(Deno.env.get('STORE')) {
    case 'cookie':
      return new CookieStore('a-secret-key')
    case 'sqlite':
      const sqlite = new sqliteDB('./database.db')
      return new SqliteStore(sqlite)
    case 'redis':
      const redis = await connectRedis({
          hostname: '0.0.0.0',
          port: 6379
      })
      return new RedisStore(redis)
    case 'webdis':
      return new WebdisStore({
          url: 'http://127.0.0.1:7379'
      })
    case 'postgres':
      const sql = postgres({
        host: 'localhost',
        port: 26257,
        database: 'defaultdb',
        user: 'root',
        password: '',
      })  
      const store = new PostgresStore(sql)
      await store.initSessionsTable()
      return store
    default:
      return new MemoryStore()
  }
} 