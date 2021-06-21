import { Application, Router } from "https://deno.land/x/oak/mod.ts"
import { OakSession, MemoryStore, SqliteStore, RedisStore, WebdisStore } from '../mod.ts'

const app = new Application()
const store = new WebdisStore({
    url: 'http://localhost:7379',
});

new OakSession(app, store)

const router = new Router();

router.get("/", async (context) => {
    // Examples of getting and setting variables on a session
    if (await context.state.session.get("pageCount") !== undefined) {
        await context.state.session.set("pageCount", await context.state.session.get("pageCount") + 1);
    } else {
        await context.state.session.set("pageCount", 0);
    }

    if ((await context.state.session.get('pageCount')) % 3 == 0) {
        await context.state.session.flash('message', 'FLASH!')
    }
    
    context.response.body = `Visited page ${await context.state.session.get("pageCount")} times!`;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8002 })