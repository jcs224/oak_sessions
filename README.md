# Oak Sessions

[![Popularity](https://img.shields.io/endpoint?url=https%3A%2F%2Fapiland.deno.dev%2Fshields%2Foak_sessions%2Fpopularity)](https://deno.land/x/oak_sessions)
[![Latest Version](https://img.shields.io/endpoint?url=https%3A%2F%2Fapiland.deno.dev%2Fshields%2Foak_sessions%2Fversion)](https://deno.land/x/oak_sessions)

Use cookie-based web sessions with the [Oak](https://github.com/oakserver/oak) framework.
Supports flash messages - session data that is deleted after it's read.

## Usage

```ts
import { Application, Router } from "jsr:@oak/oak@^17";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

type AppState = {
    session: Session
}
const app = new Application<AppState>()

app.addEventListener('error', (evt) => {
    console.log(evt.error)
})

const router = new Router<AppState>();

// Apply sessions to your Oak application.
// You can also apply the middleware to specific routes instead of the whole app.
// Without params, default MemoryStore is used. See the Storage chapter below for more info.
app.use(Session.initMiddleware())

router.post('/login', async (ctx) => {
    const form = await ctx.request.body.form()
    if(form.get('password') === 'correct') {
        // Set persistent data in the session
        ctx.state.session.set('email', form.get('email'))
        ctx.state.session.set('failed-login-attempts', null)
        // Set flash data in the session. This will be removed the first time it's accessed with get
        ctx.state.session.flash('message', 'Login successful')
    } else {
        const failedLoginAttempts = (await ctx.state.session.get('failed-login-attempts') || 0) as number
        ctx.state.session.set('failed-login-attempts', failedLoginAttempts+1)
        ctx.state.session.flash('error', 'Incorrect username or password')
    }
    ctx.response.redirect('/')
})

router.post('/logout', async (ctx) => {
    // Clear all session data
    await ctx.state.session.deleteSession()
    ctx.response.redirect('/')
})

router.get("/", async (ctx) => {
    const message = await ctx.state.session.get('message') || ''
    const error = await ctx.state.session.get('error') || ''
    const failedLoginAttempts = await ctx.state.session.get('failed-login-attempts')
    const email = await ctx.state.session.get('email')
    ctx.response.body = `<!DOCTYPE html>
    <body>
        <p>
            ${message}
        </p>
        <p>
            ${error}
        </p>
        <p>
            ${failedLoginAttempts ? `Failed login attempts: ${failedLoginAttempts}` : ''}
        </p>

        ${email ? 
        `<form id="logout" action="/logout" method="post">
            <button name="logout" type="submit">Log out ${email}</button>
        </form>`
        : 
        `<form id="login" action="/login" method="post">
            <p>
                <input id="email" name="email" type="text" placeholder="you@email.com">
            </p>
            <p>
                <input id="password" name="password" type="password" placeholder="password">
            </p>
            <button name="login" type="submit">Log in</button>
        </form>` 
    }
    </body>`;
})

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8002 });
```

## Storage

You can specify the storage layer used to store session data. Here are the supported storage layers:

* **Memory**: Stores all session data within memory. Good for debugging and testing, but should not be used in production.
* **Cookie**: Stores all session data inside of an (optionally) encrypted cookie. The simplest implementation that doesn't require a backend and is suitable for production. The disadvantage is cookies can only store a pretty limited amount of data (about 4KB in most browsers) so only use if you don't need much session data.
* **SQLite**: Uses a SQLite database to store session data. Internally, the deno [sqlite](https://deno.land/x/sqlite) library is used to interact with a SQLite database. Requires filesystem access.
* **Postgres**: Uses a Postgres database to store session data. Internally, the deno [postgres.js](https://deno.land/x/postgresjs) library is used to interact with a Postgres database. Requires a separate Postgres server.
* **Redis**: Uses a Redis database to store session data. Internally, the deno [redis](https://deno.land/x/redis) library is used to interact with a Redis database. Requires a separate Redis server.
* **Mongo**: Uses a Mongo database to store session data. Internally, the deno [mongo](https://deno.land/x/mongo) library is used to interact with MongoDB. Requires a separate MongoDB server.
* **Webdis**: Uses a Webdis endpoint to store session data. Webdis is a Redis server which allows you to use Redis with an HTTP endpoint. This is ideal for serverless environments, or anywhere that only HTTP endpoints can be accessed (such as Deno Deploy). Requires a Webdis URL.

By default, `MemoryStorage` is the storage driver, but you can (and should in production) use a more robust and persistent storage driver.

### Cookie
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, CookieStore } from "https://deno.land/x/oak_sessions/mod.ts";

const app = new Application();
// cookie name for the store is configurable, default is: {sessionDataCookieName: 'session_data'}
const store = new CookieStore('very-secret-key')

// Attach sessions to middleware
app.use(Session.initMiddleware(store));

// ...
```

### SQLite
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, SqliteStore } from "https://deno.land/x/oak_sessions/mod.ts";
import { DB } from 'https://deno.land/x/sqlite@v3.4.0/mod.ts'

const app = new Application();
const sqlite = new DB('./database.db') 
// Pass DB instance into a new SqliteStore. Optionally add a custom table name as second string argument, default is 'sessions'
const store = new SqliteStore(sqlite, 'optional_custom_table_name')

// Attach sessions to middleware. 
app.use(Session.initMiddleware(store))

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
app.use(Session.initMiddleware(store));

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
app.use(Session.initMiddleware(store));

// ...
```

### Mongo
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, MongoStore } from "https://deno.land/x/oak_sessions/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.29.4/mod.ts";

const app = new Application();

// Create mongo connection or use an existing one
const client = new MongoClient();
const db = client.database('default');

// Pass mongo connection into a new MongoStore. Optionally add a custom collection name as second string argument, default is 'sessions'
const store = new MongoStore(db, 'optional_custom_collection_name');

// Attach sessions to middleware
app.use(Session.initMiddleware(store));

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
app.use(Session.initMiddleware(store));

// ...
```

More stores will be added over time.

## Cookie

Whichever store you are using, a session id is requred to be saved in cookie so incoming requests can be identified.
You can modified the options used when setting / deleting session id in cookie. Note that this option is different from options in `CookieStore`.

```ts
app.use(Session.initMiddleware(store, {
    cookieSetOptions: {
        httpOnly: true,
        sameSite: "none",
        secure: true
    },
    cookieGetOptions: {}
}))
```

## Session key rotation

Sometimes, you'll want to rotate the session key to help prevent session fixation attacks. If you're using this library to authenticate users, it's wise to rotate the key immediately after the user logs in. 

To rotate the session key, simply add an Oak context state variable on the appropriate route or middleware. The variable can be set before or after the session is initialized.

```js
(ctx, next) => {
    ctx.state.rotate_session_key = true
}
```

> :warning: Session key rotation isn't necessary with CookieStore, by nature of how storing all session data in a cookie works, instead of just a session ID. See the [iron-session](https://github.com/vvo/iron-session#what-are-the-drawbacks) FAQ, which explains the reasoning very well.

## Migrating from 3.x to 4.x
There are some breaking changes in how you initialize your session, but all of the `ctx.state.session` methods (`get`, `set`, `flash`, `has`) still work as they did before, except `deleteSession` no longer takes any arguments, which may or may not be breaking depending on how it's used in your project.

See more detail in the [migration guide](https://github.com/jcs224/oak_sessions/wiki/Migration-guide) wiki.

## Using the library with the correct `oak` version

To keep up with the correct types, you have to use the correct major version to match with the corresponding version of `oak`.

| Oak version | Session library version |
| --- | --- |
| ^12 | ^4.1.12
| ^13 | ^5.0.0 |
| ^14 | ^6.0.0 |
| ^15 | ^7.0.0 |
| ^16 | ^8.0.0 |
| ^17 | ^9.0.0 |