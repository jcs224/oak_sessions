import {
  CookieStore,
  MemoryStore,
  PostgresStore,
  RedisStore,
  SqliteStore,
  MongoStore,
  Store,
  WebdisStore,
} from "../mod.ts";
import { connect as connectRedis } from "https://deno.land/x/redis@v0.27.0/mod.ts";
import { DB as sqliteDB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.29.4/mod.ts";
import postgres from "https://deno.land/x/postgresjs@v3.2.4/mod.js";

export function makeStore(): Promise<Store | CookieStore> {
  const storeType = Deno.env.get("STORE");
  console.info(`Creating session store of type ${storeType}`);

  switch (storeType) {
    case "cookie":
      return createCookieStore();
    case "sqlite":
      return createSQLiteStore();
    case "redis":
      return createRedisStore();
    case "webdis":
      return createWebdisStore();
    case "postgres":
      return createPostgresStore();
    case "mongo":
      return createMongoStore();
    case "memory":
      return createMemoryStore();
    default:
      throw new Error(`Unknown STORE type specified: ${storeType}`);
  }
}

function createCookieStore() {
  return Promise.resolve(new CookieStore("mandatory-encryption-passphrase"));
}

function createMemoryStore() {
  return Promise.resolve(new MemoryStore());
}

function createSQLiteStore() {
  const sqlite = new sqliteDB("./database.db");
  const store = new SqliteStore(sqlite);
  return Promise.resolve(store);
}

function createWebdisStore() {
  const store = new WebdisStore({
    url: "http://127.0.0.1:7379",
  });
  return Promise.resolve(store);
}

async function createPostgresStore() {
  const sql = postgres({
    host: "localhost",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "postgres",
  });
  const store = new PostgresStore(sql);
  await store.initSessionsTable();
  return store;
}

async function createMongoStore() {
  const client = new MongoClient();
  const mongo = await client.connect("mongodb://localhost:27017");
  return new MongoStore(mongo);
}

async function createRedisStore() {
  const redis = await connectRedis({
    hostname: "0.0.0.0",
    port: 6379,
  });
  return new RedisStore(redis);
}
