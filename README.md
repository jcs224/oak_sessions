# Deno Sessions

Sessions adds the ability to use sessions with deno web frameworks. It currently supports the following frameworks:

* [**Oak**](https://deno.land/x/oak)
* [**Opine**](https://deno.land/x/opine)

You can also specify the storage layer used to store session data. Here are the supported storage layers:

* **Memory**: Stores all session data within memory. Good for debugging and testing, but should not be used in production.
* **SQLite**: Uses a SQLite database to store session data. Internally, the deno [sqlite](https://deno.land/x/sqlite) library is used to interact with a SQLite database. Requires filesystem access.
* **Redis**: Uses a Redis database to store session data. Internally, the deno [redis](https://deno.land/x/redis) library is used to interact with a Redis database. Requires a separate Redis server.
* **Webdis**: Uses a Webdis endpoint to store session data. Webdis is a Redis server which allows you to use Redis with an HTTP endpoint. This is ideal for serverless environments, or anywhere that only HTTP endpoints can be accessed (such as Deno Deploy). Requires a Webdis URL.

## Usage

Here are some examples with various web frameworks:

### Oak
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { OakSession } from "https://deno.land/x/sessions/mod.ts";

const app = new Application();

// Attach sessions to middleware
const session = new OakSession(app);

const router = new Router();

router.get("/", async (context) => {

    // Examples of getting and setting variables on a session
    if (!await context.state.session.has("pageCount")) {
        await context.state.session.set("pageCount", 0);

    } else {
        await context.state.session.set("pageCount", await context.state.session.get("pageCount") + 1);
    }

    // If you only want a variable to survive for a single request, you can "flash" it instead
    await context.state.session.flash("message", "I am good for form validations errors, success messages, etc.")
    
    context.response.body = `Visited page ${await context.state.session.get("pageCount")} times`;
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
```

### Opine (with Redis storage)
```ts
import { opine } from "https://deno.land/x/opine/mod.ts";
import { OpineSession, RedisStore } from '../session-2/mod.ts'

const app = new opine()
const store = new RedisStore({
  host: '0.0.0.0',
  port: 6379
})

await store.init()

const session = new OpineSession(app, {}, store)

app.use("/", async (req, res) => {
  // Examples of getting and setting variables on a session
  if (await req.session.has("pageCount")) {
    await req.session.set("pageCount", await req.session.get("pageCount") + 1);
  } else {
    await req.session.set("pageCount", 0);
  }

  res.setStatus(200).send(`Visited page ${await req.session.get("pageCount")} times`)
});

app.listen(8002, () => console.log("Server at http://localhost:8080"));
```

## Storage
By default, `MemoryStorage` is the storage driver, but you can (and should in production) use a more robust and persistent storage driver. Here are some options:

### SQLite
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { OakSession, SqliteStore } from "https://deno.land/x/sessions/mod.ts";

const app = new Application();
const store = new SqliteStore({
    path: './database.db',
    tableName: 'sessions' // optional
})

// Attach sessions to middleware
const session = new OakSession(app, store);

// ...
```

### Redis
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { OakSession, RedisStore } from "https://deno.land/x/sessions/mod.ts";

const app = new Application();
const store = new RedisStore({
    host: '127.0.0.1',
    port: 6379
});

// Since Redis connection is async, must be initialized before used
await store.init();

// Attach sessions to middleware
const session = new OakSession(app, store);

// ...
```

### Webdis
```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { OakSession, WebdisStore } from "https://deno.land/x/sessions/mod.ts";

const app = new Application();
const store = new WebdisStore({
    url: 'http://127.0.0.1:7379',
});

// Attach sessions to middleware
const session = new OakSession(app, store);

// ...
```

More stores will be added over time.
