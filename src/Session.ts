import { nanoid } from 'https://deno.land/x/nanoid@v3.0.0/async.ts'
import MemoryStore from './stores/MemoryStore.ts'
import CookieStore from './stores/CookieStore.ts'
import { Context } from 'https://deno.land/x/oak@v9.0.0/context.ts'
import Store from './stores/Store.ts'
import { DateTime } from 'https://jspm.dev/luxon@2.0.2'

interface SessionOptions {
  expireAfterSeconds?: number
}
export default class Session {
  id: string | null
  store: Store
  context: Context | null
  expiration: number | null

  constructor (store : Store = new MemoryStore, options? : SessionOptions) {
    this.id = null
    this.store = store
    this.context = null
    this.expiration = options && options.expireAfterSeconds ? options.expireAfterSeconds : null
  }

  initMiddleware() {
    return async (ctx : Context, next : () => Promise<unknown>) => {
      this.context = ctx

      if (typeof this.store.insertSessionMiddlewareContext !== 'undefined') {
        await this.store.insertSessionMiddlewareContext(ctx)
      }

      const sid = await ctx.cookies.get('session')

      if (sid 
        && await this.sessionExists(sid) 
        && await this.sessionValid(sid)
      ) {
        ctx.state.session = this.getSession(sid)
        await ctx.state.session.reupSession(sid)
      } else {
        if (sid 
          && await this.sessionExists(sid)
          && !await this.sessionValid(sid)
        ) {
          await this.deleteSession(sid)
        }

        ctx.state.session = await this.createSession()
        await ctx.cookies.set('session', ctx.state.session.id)
        await ctx.state.session.set(
          '_expire', 
          this.expiration ? DateTime.now().setZone('UTC').plus({ seconds: this.expiration }).toISO() : null
        )
      }

      await ctx.state.session.set('_flash', {})

      await next()

      if (typeof this.store.afterMiddlewareHook !== 'undefined') {
        await this.store.afterMiddlewareHook()
      }
    }
  }

  async sessionExists(id : string) {
    return await this.store.sessionExists(id)
  }

  async sessionValid(id : string) {
    const session = await this.store.getSessionById(id)

    if (this.expiration) {
      if (DateTime.now() < DateTime.fromISO(session._expire)) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

  async reupSession(id : string) {
    const session = await this.store.getSessionById(id)
    session._expire = this.expiration ? DateTime.now().setZone('UTC').plus({ seconds: this.expiration }).toISO() : null
    await this.store.persistSessionData(id, session)
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

  async set(key : string, value : unknown) {
    if (typeof this.id == 'string') {
      const session = await this.store.getSessionById(this.id)

      session[key] = value

      await this.store.persistSessionData(this.id, session)
    } 
  }

  async flash(key : string, value : unknown) {
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
