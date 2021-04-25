# Session - Sessions for Deno Web Frameworks

Session adds the ability to use sessions with deno web frameworks. Session is very easy to use and takes inspiration from the express-sessions library. Session currently supports the following deno web frameworks:

* [**Oak**](https://deno.land/x/oak)

Session allows you to specify the store used to store session data. Session currently supports the following stores:

* **MemoryStore**: Stores all session data within memory. Good for debugging and testing, but should not be used in production.
* **SqliteStore**: Uses a SQLite database to store session data. Internally, the deno [sqlite](https://deno.land/x/sqlite) library is used to interact with a SQLite database.
* **RedisStore**: Uses a Redis database to store session data. Internally, the deno [redis](https://deno.land/x/redis) library is used to interact with a Redis database.

## Usage

To use Session, you need to first add in Session as middleware. Once added, you can get and set variables for the session using the **get** and **set** functions on the session variable created. Below are examples of adding and using Session with various frameworks:

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
    if (await context.state.session.get("pageCount") === undefined) {
        await context.state.session.set("pageCount", 0);

    } else {
        await context.state.session.set("pageCount", await context.state.session.get("pageCount") + 1);
    }
    
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
  if (await req.session.get("pageCount") !== undefined) {
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

More stores will be added over time.
