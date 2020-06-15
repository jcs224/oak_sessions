# Session - Sessions for Deno Web Frameworks

Session adds the ability to use sessions with deno web frameworks. Session is very easy to use and takes inspiration from the express-sessions library. Session currently supports the following deno web frameworks:

* [**Oak**](https://deno.land/x/oak)
* [**Attain**](https://deno.land/x/attain)


Session allows you to specify the store used to store session data. Session currently supports the following stores:

* **MemoryStore ("memory")**: Stores all session data within memory. Good for debugging and testing, but should not be used in production.
* **RedisStore ("redis")**: Uses the Redis database to store session data. Internally, the deno [redis](https://deno.land/x/redis) library is used as the driver to interact with a redis database.


## Usage

To use Session, you need to first add in Session as middleware. Once added, you can get and set variables for the session using the **get** and **set** functions on the session variable created. Below are examples of adding and using Session in various web frameworks:


### Oak

```ts
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session } from "https://deno.land/x/session/mod.ts";

const app = new Application();

// Configuring Session for the Oak framework
const session = new Session({ framework: "oak" });
await session.init();

// Adding the Session middleware. Now every context will include a property
// called session that you can use the get and set functions on
app.use(session.use()(session));


// Creating a Router and using the session
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

### Attain

```ts
import { App, logger } from "https://deno.land/x/attain/mod.ts";
import { Session } from "https://deno.land/x/session/mod.ts";

const app = new App();

const session = new Session({ framework: "attain" })
await session.init();

app.use(logger);
app.use(session.use()(session)); // able to add options at second params

app.use("/", async (req, res) => {
  // Examples of getting and setting variables on a session
  if (await req.session.get("pageCount") === undefined) {
    await req.session.set("pageCount", 0);
  } else {
    await req.session.set("pageCount", await req.session.get("pageCount") + 1);
  }
  res.status(200).send(`Visited page ${await req.session.get("pageCount")} times`)
});

console.log("Server at http://localhost:8080");
await app.listen({ port: 8080 });
```

### Cookie Options
```ts
// These are default options
app.use(session.use()(session, { path: "/", httpOnly: true, secure: false }))
```
- `expires?: Date`: Max-Age of the Cookie. Must be integer superior to 0.
- `maxAge?: number`: Specifies those hosts to which the cookie will be sent.
- `domain?: string`: Indicates a URL path that must exist in the request.
- `path?: string`: Indicates if the cookie is made using SSL & HTTPS.
- `secure?: boolean`: Indicates that cookie is not accessible via JavaScript.
- `httpOnly?: boolean`: Allows servers to assert that a cookie ought not to be sent along with cross-site requests.
- `sameSite?: SameSite`: Additional key value pairs with the form "key=value"
- `unparsed?: string[]`


## Configurations

You can add configuration options within the Session constructor to specify the framework, store, and store configurations. Below is the simplest configuration, providing only a framework name:

```javascript
const session = new Session({
    framework: "oak",
});
```

By default if no store is chosen, the memory store will be used. You can also explicitly chose this store in the configuration:

```javascript
const session = new Session({
    framework: "oak",
    store: "memory",
});
```

If choosing the Redis store, you also need to provide additional configurations (in this case **hostname** and **port**):

```javascript
const session = new Session({
    framework: "oak",
    store: "redis",
    hostname: "127.0.0.1";
    port: 6379,
});
```


## Implementation details

Session works by adding a cookie with the key **sid** and a cryptographically generated UUID v4 as the value for sid. This key is what is used to access all of the session data.

Stores are added internally by implementing the **IStore** interface. All stores implemented with this interface can be used with Session, allowing you to easily create custom stores for this library.


## License

MIT License

Copyright (c) 2020 Anthony Mancini and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
