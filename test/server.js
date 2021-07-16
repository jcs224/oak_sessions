import { Application, Router } from "https://deno.land/x/oak/mod.ts"
import { Session, RedisStore, SqliteStore, WebdisStore, MemoryStore } from '../mod.ts'

const app = new Application()

const store = new MemoryStore

// const store = new SqliteStore({
//     path: './database.db'
// })

// const store = new RedisStore({
//     host: '0.0.0.0',
//     port: 6379,
// })
// await store.init()

// const store = new WebdisStore({
//     url: 'http://127.0.0.1:7379'
// })

new Session(app, store)

const router = new Router();

router.post('/delete', async (ctx) => {
    await ctx.state.session.deleteSession()

    ctx.response.redirect('/')
}).get("/", async (context) => {
    // Examples of getting and setting variables on a session
    if (await context.state.session.has("pageCount")) {
        await context.state.session.set("pageCount", await context.state.session.get("pageCount") + 1);
    } else {
        await context.state.session.set("pageCount", 0);
    }

    if ((await context.state.session.get('pageCount')) % 3 == 0) {
        await context.state.session.flash('message', 'FLASH!!')
    }
    
    context.response.body = `
    <body>
        Visited page ${await context.state.session.get("pageCount")} times!</br>
        ${await context.state.session.has('message') ? await context.state.session.get('message') : ''}
        <form action="/delete" method="post">
        <input type="hidden" name="_deleteSession" value="true" />
        <button type="submit">Delete Session</button>
        </form>
    </body>`;
})

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8002 })