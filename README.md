# Oak Sessions

Use cookie-based web sessions with the Oak framework.

## Usage

```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

const app = new Application();

// Instantiate session
const session = new Session();
const router = new Router();

// Apply sessions your Oak application. You can also apply the middleware to specific routes instead of the whole app.
app.use(session.initMiddleware())

router.get("/session", async (ctx) => {

    // Examples of getting and setting variables on a session
    if (!await ctx.state.session.has("pageCount")) {
        await ctx.state.session.set("pageCount", 0);

    } else {
        await ctx.state.session.set("pageCount", await ctx.state.session.get("pageCount") + 1);
    }

    // If you only want a variable to survive for a single request, you can "flash" it instead
    await ctx.state.session.flash("message", "I am good for form validations errors, success messages, etc.")
    
    ctx.response.body = `Visited page ${await ctx.state.session.get("pageCount")} times`;
})
.post('/delete', async (ctx) => {
    // Call the delete method
    await ctx.state.session.deleteSession()
    // Optionally, you can also pass the context if you're not in a session route
    // await session.deleteSession(ctx)
    // or, the string of the session ID in case you aren't within any routing context.
    // await session.deleteSession(ctx.cookies.get('session'))

    ctx.response.redirect('/')
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
```

## Storage

You can specify the storage layer used to store session data. Here are the supported storage layers:

* **Memory**: Stores all session data within memory. Good for debugging and testing, but should not be used in production.
* **Cookie**: Stores all session data inside of an (optionally) encrypted cookie. The simplest implementation that doesn't require a backend and is suitable for production. The disadvantage is cookies can only store a pretty limited amount of data (about 4KB in most browsers) so only use if you don't need much session data.
* **SQLite**: Uses a SQLite database to store session data. Internally, the deno [sqlite](https://deno.land/x/sqlite) library is used to interact with a SQLite database. Requires filesystem access.
* **Postgres**: Uses a Postgres database to store session data. Internally, the deno [postgres.js](https://deno.land/x/postgresjs) library is used to interact with a Postgres database. Requires filesystem access.
* **Redis**: Uses a Redis database to store session data. Internally, the deno [redis](https://deno.land/x/redis) library is used to interact with a Redis database. Requires a separate Redis server.
* **Webdis**: Uses a Webdis endpoint to store session data. Webdis is a Redis server which allows you to use Redis with an HTTP endpoint. This is ideal for serverless environments, or anywhere that only HTTP endpoints can be accessed (such as Deno Deploy). Requires a Webdis URL.

By default, `MemoryStorage` is the storage driver, but you can (and should in production) use a more robust and persistent storage driver.

### Cookie
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, CookieStore } from "https://deno.land/x/oak_sessions/mod.ts";

const app = new Application();
const store = new CookieStore('very-secret-key')

// Attach sessions to middleware
const session = new Session(store);

// ...
```

### SQLite
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, SqliteStore } from "https://deno.land/x/oak_sessions/mod.ts";
import { DB } from 'https://deno.land/x/sqlite@v2.4.0/mod.ts'

const app = new Application();
const sqlite = new DB('./database.db') 
// Pass DB instance into a new SqliteStore. Optionally add a custom table name as second string argument, default is 'sessions'
const store = new SqliteStore(sqlite, 'optional_custom_table_name')

// Attach sessions to middleware. 
const session = new Session(store);

// ...
```

### Postgres
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, PostgresStore } from "https://deno.land/x/oak_sessions/mod.ts";
import postgres from 'https://deno.land/x/postgresjs@v3.1.0/mod.js'

const app = new Application();

// Create a postgres connection, or use an existing one
const sql = postgres({
    host: 'localhost',
    port: 26257,
    database: 'defaultdb',
    user: 'root',
    password: '',
})

// Pass postgres connection into a new PostgresStore. Optionally add a custom table name as second string argument, default is 'sessions'
const store = new PostgresStore(sql, 'optional_custom_table_name')

// Initialize sessions table. Will create a table if one doesn't exist already.
await store.initSessionsTable()

// Attach sessions to middleware
const session = new Session(store)

// ...
```

### Redis
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, RedisStore } from "https://deno.land/x/oak_sessions/mod.ts";

// import the Redis library
import { connect } from 'https://deno.land/x/redis@v0.25.0/mod.ts'

const app = new Application();

// Create a redis connection
const redis = await connect({
    hostname: '0.0.0.0',
    port: 6379
})

// pass redis connection into a new RedisStore. Optionally add a second string argument for a custom database prefix, default is 'session_'
const store = new RedisStore(redis)

// Attach sessions to middleware
const session = new Session(store);

// ...
```

### Webdis
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, WebdisStore } from "https://deno.land/x/oak_sessions/mod.ts";

const app = new Application();
const store = new WebdisStore({
    url: 'http://127.0.0.1:7379',
});

// Attach sessions to middleware
const session = new Session(store);

// ...
```

More stores will be added over time.
