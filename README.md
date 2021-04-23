# Session - Sessions for Deno Web Frameworks

Session adds the ability to use sessions with deno web frameworks. Session is very easy to use and takes inspiration from the express-sessions library. Session currently supports the following deno web frameworks:

* [**Oak**](https://deno.land/x/oak)

Session allows you to specify the store used to store session data. 

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

## License

MIT License

Copyright (c) 2020 Anthony Mancini, Joe Sweeney and contributors

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
