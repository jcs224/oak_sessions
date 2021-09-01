import { Application, Router } from "https://deno.land/x/oak@v7.7.0/mod.ts"
import { Session, RedisStore, SqliteStore, WebdisStore, MemoryStore, CookieStore } from '../mod.ts'
import { connect as connectRedis } from 'https://deno.land/x/redis@v0.22.2/mod.ts'
import { DB as sqliteDB } from 'https://deno.land/x/sqlite@v2.4.0/mod.ts'

const app = new Application()

app.addEventListener('error', (evt) => {
    console.log(evt.error)
})

const store = new MemoryStore

// const store = new CookieStore('a-secret-key')

// const sqlite = new sqliteDB('./database.db')
// const store = new SqliteStore(sqlite)

// const redis = await connectRedis({
//     hostname: '0.0.0.0',
//     port: 6379
// })
// const store = new RedisStore(redis)

// const store = new WebdisStore({
//     url: 'http://127.0.0.1:7379'
// })

const router = new Router();
const session = new Session(store)

// new Session(router, store)

router.post('/delete', async (ctx) => {
    await session.deleteSession(ctx)

    ctx.response.redirect('/')
})

.get("/", session.initMiddleware(), async (context) => {
    // Examples of getting and setting variables on a session
    if (await context.session.has("pageCount")) {
        await context.session.set("pageCount", await context.session.get("pageCount") + 1);
    } else {
        await context.session.set("pageCount", 0);
    }

    if ((await context.session.get('pageCount')) % 3 == 0) {
        await context.session.flash('message', 'FLASH!!')
    }
    
    context.response.body = `
    <body>
        Visited page ${await context.session.get("pageCount")} times!</br>
        ${await context.session.has('message') ? await context.session.get('message') : ''}
        <form action="/delete" method="post">
        <input type="hidden" name="_skipSession" value="true" />
        <button type="submit">Delete Session</button>
        </form>
    </body>`;

    // context.response.body = 'lamesauce'
})

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8002 })