import { Application, Router, Context } from "../deps.ts"
import { Session, RedisStore, SqliteStore, WebdisStore, MemoryStore, CookieStore, PostgresStore } from '../mod.ts'
import { connect as connectRedis } from 'https://deno.land/x/redis@v0.25.0/mod.ts'
import { DB as sqliteDB } from 'https://deno.land/x/sqlite@v2.4.0/mod.ts'
import postgres from 'https://deno.land/x/postgresjs@v3.1.0/mod.js'

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

// const sql = postgres({
//     host: 'localhost',
//     port: 26257,
//     database: 'defaultdb',
//     user: 'root',
//     password: '',
// })
//
// const store = new PostgresStore(sql)
// await store.initSessionsTable()

const router = new Router();
const session = new Session(store)

// new Session(router, store)

app.use(session.initMiddleware())

router.post('/delete', async (ctx) => {
    await ctx.state.session.deleteSession()
    ctx.response.redirect('/')
})

.post('/increment2', async (ctx) => {
    if (await ctx.state.session.has("incrementor2")) {
        await ctx.state.session.set("incrementor2", await ctx.state.session.get("incrementor2") + 1);
    } else {
        await ctx.state.session.set("incrementor2", 0);
    }

    ctx.response.redirect('/')
})

.post('/increment', async (ctx) => {
    if (await ctx.state.session.has("incrementor1")) {
        await ctx.state.session.set("incrementor1", await ctx.state.session.get("incrementor1") + 1);
    } else {
        await ctx.state.session.set("incrementor1", 0);
    }

    ctx.response.redirect('/')
})

.get("/", async (context) => {
    // Examples of getting and setting variables on a session
    if (await context.state.session.has("incrementor1")) {
        await context.state.session.get("incrementor1")
    } else {
        await context.state.session.set("incrementor1", 0)
    }

    if (await context.state.session.has("incrementor2")) {
        await context.state.session.get("incrementor2")
    } else {
        await context.state.session.set("incrementor2", 0)
    }

    if ((await context.state.session.get('incrementor1')) % 3 == 0) {
        await context.state.session.flash('message', 'FLASH!!')
    }
    
    context.response.body = `
    <body>
        First counter: ${await context.state.session.get("incrementor1")} ${await context.state.session.has('message') ? await context.state.session.get('message') : ''}</br>
        Second counter: ${await context.state.session.get("incrementor2")}</br></br>
        <form action="/increment" method="post">
        <button id="inc-button" type="submit">Increment first counter</button>
        </form>

        <form action="/increment2" method="post">
        <button id="inc-button-2" type="submit">Increment second counter</button>
        </form>

        <form action="/delete" method="post">
        <button id="del-button" type="submit">Delete Session</button>
        </form>
    </body>`;

    // context.response.body = 'lamesauce'
})

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8002 })
console.log('test server running')