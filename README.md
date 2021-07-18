# Oak Sessions

Use cookie-based web sessions with the Oak framework.

## Usage

```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session } from "https://deno.land/x/sessions/mod.ts";

const app = new Application();

// Instantiate session
const session = new Session();
const router = new Router();

// Include the session.initMiddleware on the routes you want to use sessions for
router.get("/", session.initMiddleware(), async (ctx) => {

    // Examples of getting and setting variables on a session
    if (!await ctx.session.has("pageCount")) {
        await ctx.session.set("pageCount", 0);

    } else {
        await ctx.session.set("pageCount", await ctx.session.get("pageCount") + 1);
    }

    // If you only want a variable to survive for a single request, you can "flash" it instead
    await ctx.session.flash("message", "I am good for form validations errors, success messages, etc.")
    
    ctx.response.body = `Visited page ${await ctx.session.get("pageCount")} times`;
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
```

## Storage

You can specify the storage layer used to store session data. Here are the supported storage layers:

* **Memory**: Stores all session data within memory. Good for debugging and testing, but should not be used in production.
* **SQLite**: Uses a SQLite database to store session data. Internally, the deno [sqlite](https://deno.land/x/sqlite) library is used to interact with a SQLite database. Requires filesystem access.
* **Redis**: Uses a Redis database to store session data. Internally, the deno [redis](https://deno.land/x/redis) library is used to interact with a Redis database. Requires a separate Redis server.
* **Webdis**: Uses a Webdis endpoint to store session data. Webdis is a Redis server which allows you to use Redis with an HTTP endpoint. This is ideal for serverless environments, or anywhere that only HTTP endpoints can be accessed (such as Deno Deploy). Requires a Webdis URL.

By default, `MemoryStorage` is the storage driver, but you can (and should in production) use a more robust and persistent storage driver.

### SQLite
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, SqliteStore } from "https://deno.land/x/sessions/mod.ts";

const app = new Application();
const store = new SqliteStore({
    path: './database.db',
    tableName: 'sessions' // optional
})

// Attach sessions to middleware
const session = new Session(store);

// ...
```

### Redis
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, RedisStore } from "https://deno.land/x/sessions/mod.ts";

const app = new Application();
const store = new RedisStore({
    host: '127.0.0.1',
    port: 6379
});

// Since Redis connection is async, must be initialized before used
await store.init();

// Attach sessions to middleware
const session = new Session(store);

// ...
```

### Webdis
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session, WebdisStore } from "https://deno.land/x/sessions/mod.ts";

const app = new Application();
const store = new WebdisStore({
    url: 'http://127.0.0.1:7379',
});

// Attach sessions to middleware
const session = new Session(store);

// ...
```

More stores will be added over time.
