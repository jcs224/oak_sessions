import { nanoid } from 'https://deno.land/x/nanoid@v3.0.0/async.ts'
import MemoryStore from './stores/MemoryStore.ts'
import CookieStore from './stores/CookieStore.ts'
import { Context } from 'https://deno.land/x/oak@v9.0.0/context.ts'
import Store from './stores/Store.ts'

interface SessionContext extends Context {
  session: any
}

export default class Session {
  id: string | null
  store: Store
  context: Context | null

  constructor (store : Store = new MemoryStore) {
    this.id = null
    this.store = store
    this.context = null
  }

  initMiddleware() {
    return async (ctx : SessionContext, next : () => Promise<unknown>) => {
      this.context = ctx

      if (typeof this.store.insertSessionMiddlewareContext !== 'undefined') {
        await this.store.insertSessionMiddlewareContext(ctx)
      }

      const sid = await ctx.cookies.get('session')

      if (sid && await this.sessionExists(sid)) {
        ctx.session = this.getSession(sid)
      } else {
        ctx.session = await this.createSession()
        await ctx.cookies.set('session', ctx.session.id)
      }

      await ctx.session.set('_flash', {})

      await next()

      if (typeof this.store.afterMiddlewareHook !== 'undefined') {
        await this.store.afterMiddlewareHook()
      }
    }
  }

  async sessionExists(id : string) {
    return await this.store.sessionExists(id)
  }

  async createSession() {
    this.id = await nanoid(21)
    await this.store.createSession(this.id)
    return this
  }

  getSession(id : string) {
    this.id = id
    return this
  }

  async deleteSession(sessionIdOrContext : string | Context) {
    if (typeof sessionIdOrContext == 'string') {
      let sessionId = sessionIdOrContext
      await this.store.deleteSession(sessionId)
    } else {
      let ctx = sessionIdOrContext
      if (sessionIdOrContext instanceof Context && this.store instanceof CookieStore) {
        await this.store.deleteSession(ctx)
      } else {
        const sessionID : string | undefined = await ctx.cookies.get('session')
        if (typeof sessionID == 'string') {
          await this.store.deleteSession(sessionID)
        }
      }
    }

    if (this.context instanceof Context) {
      await this.context.cookies.delete('session')
    }
  }

  async get(key : string) {
    if (typeof this.id == 'string') {
      const session = await this.store.getSessionById(this.id)

      if (session.hasOwnProperty(key)) {
        return session[key]
      } else {
        return session['_flash'][key]
      }
    }
  }

  async set(key : string, value : string | number) {
    if (typeof this.id == 'string') {
      const session = await this.store.getSessionById(this.id)

      session[key] = value

      await this.store.persistSessionData(this.id, session)
    } 
  }

  async flash(key : string, value : string | number) {
    if (typeof this.id == 'string') {
      const session = await this.store.getSessionById(this.id)

      session['_flash'][key] = value

      await this.store.persistSessionData(this.id, session)
    }
  }

  async has(key : string) {
    if (typeof this.id == 'string') {
      const session = await this.store.getSessionById(this.id)

      if (session.hasOwnProperty(key)) {
        return true
      } else {
        if (session['_flash'].hasOwnProperty(key)) {
          return true
        } else {
          return false
        }
      }
    } else {
      return false
    }
  }
}