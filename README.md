# Session - Sessions for Deno Web Frameworks

Session adds the ability to use sessions with deno web frameworks. Session is very easy to use and takes inspiration from the express-sessions library. Session currently supports the following deno web frameworks:

* [**Oak**](https://deno.land/x/oak)

Session allows you to specify the store used to store session data. Session currently supports the following stores:

* **MemoryStore**: Stores all session data within memory. Good for debugging and testing, but should not be used in production.
* **SqliteStore**: Uses the SQLite database to store session data. Internally, the deno [sqlite](https://deno.land/x/sqlite) library is used to interact with a SQLite database.


## Usage

To use Session, you need to first add in Session as middleware. Once added, you can get and set variables for the session using the **get** and **set** functions on the session variable created. Below are examples of adding and using Session in Oak:


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

By default, `MemoryStorage` is the storage driver, but you can (and should in production) use a more robust and persistent storage driver. Here's an example of using the SQLite driver:

```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { OakSession, SqliteStore } from "https://deno.land/x/sessions/mod.ts";

const app = new Application();
const store = new SqliteStore('./database.db')

// Attach sessions to middleware
const session = new OakSession(app, store);

// ...
```

More stores will be added over time.