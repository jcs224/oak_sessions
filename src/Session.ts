import { nanoid } from 'https://deno.land/x/nanoid@v3.0.0/async.ts'
import MemoryStore from './stores/MemoryStore.ts'
import CookieStore from './stores/CookieStore.ts'
import { Context } from 'https://deno.land/x/oak@v9.0.0/context.ts'
import Store from './stores/Store.ts'
import { DateTime } from 'https://jspm.dev/luxon@2.0.2'
import { CookiesGetOptions, CookiesSetDeleteOptions } from 'https://deno.land/x/oak@v9.0.0/cookies.ts'

interface SessionOptions {
  expireAfterSeconds?: number
}

export default class Session {
  context: Context | null
  store: Store
  expiration: number | null
  cookieSetOption: CookiesSetDeleteOptions
  cookieGetOption: CookiesGetOptions

  constructor (store : Store = new MemoryStore, options? : SessionOptions, cookieSetOption? : CookiesSetDeleteOptions, cookieGetOption? : CookiesGetOptions) {
    this.context = null
    this.store = store
    this.expiration = options && options.expireAfterSeconds ? options.expireAfterSeconds : null
    this.cookieGetOption = cookieGetOption ?? {}
    this.cookieSetOption = cookieSetOption ?? {}
  }

  initMiddleware() {
    return async (ctx : Context, next : () => Promise<unknown>) => {
      this.context = ctx

      if (typeof this.store.insertSessionMiddlewareContext !== 'undefined') {
        await this.store.insertSessionMiddlewareContext(ctx)
      }

      const sid = await ctx.cookies.get('session', this.cookieGetOption)
      ctx.state.session = this
      ctx.state.sessionCache = null

      if (sid) {
        const session = await this.getSession(sid, true)

        if (session) {
          if (await this.sessionValid(sid)) {
            await this.reupSession(sid)
            ctx.state.sessionID = sid
          } else {
            await this.deleteSession(sid)
            ctx.state.sessionID = await this.createSession()
          }
        } else {
          ctx.state.sessionID = await this.createSession()
        }
      } else {
        ctx.state.sessionID = await this.createSession()
      }

      await this.set('_flash', {})
      await ctx.cookies.set('session', ctx.state.sessionID, this.cookieSetOption)

      await next()

      await this.persistSessionData(
        ctx.state.sessionID, 
        await this.getSession(ctx.state.sessionID), 
        true
      )

      if (typeof this.store.afterMiddlewareHook !== 'undefined') {
        await this.store.afterMiddlewareHook()
      }
    }
  }

  async sessionValid(id : string) {
    const session = await this.getSession(id)

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
    const session = await this.getSession(id)
    session._expire = this.expiration ? DateTime.now().setZone('UTC').plus({ seconds: this.expiration }).toISO() : null
    await this.persistSessionData(id, session)
  }

  async createSession() {
    const session = {
      '_flash': {},
      '_expire': this.expiration ? DateTime.now().setZone('UTC').plus({ seconds: this.expiration }).toISO() : null
    }

    const newID = await nanoid(21)
    await this.store.createSession(newID, session)
    if (this.context) this.context.state.sessionCache = session

    return newID
  }

  async getSession(id : string, pullFromStore : boolean = false) {
    let session = null

    if (pullFromStore) {
      session = await this.store.getSessionById(id)
      if (this.context) this.context.state.sessionCache = session
    } else {
      if (this.context && this.context.state.sessionCache) {
        session = this.context.state.sessionCache
      } else {
        session = await this.store.getSessionById(id)
      }
    }

    if (session) {
      return session
    } else {
      return null
    }
  }

  async deleteSession(sessionIdOrContext : string | Context) {
    if (typeof sessionIdOrContext == 'string') {
      let sessionId = sessionIdOrContext
      await this.store.deleteSession(sessionId)
      if (this.context) this.context.state.sessionCache = null
    } else {
      let ctx = sessionIdOrContext

      if (sessionIdOrContext instanceof Context) {
        const sessionID : string | undefined = await ctx.cookies.get('session', this.cookieGetOption)
        if (sessionID) {
          if (this.context) this.context.state.sessionCache = null
        }
      }

      if (sessionIdOrContext instanceof Context && this.store instanceof CookieStore) {
        await this.store.deleteSession(ctx)
      } else {
        const sessionID : string | undefined = await ctx.cookies.get('session', this.cookieGetOption)
        if (typeof sessionID == 'string') {
          await this.store.deleteSession(sessionID)
        }
      }
    }

    if (this.context instanceof Context) {
      await this.context.cookies.delete('session', this.cookieSetOption)
    }
  }

  async persistSessionData(id : string, data: Object, pushToStore : boolean = false) {
    if (this.context) this.context.state.sessionCache = data

    if (pushToStore) {
      await this.store.persistSessionData(id, data)
    }
  }

  async get(key : string) {
    if (this.context) {
      const session = await this.getSession(this.context.state.sessionID)

      if (session.hasOwnProperty(key)) {
        return session[key]
      } else {
        return session['_flash'][key]
      }
    } else {
      return null
    }
  }

  async set(key : string, value : unknown) {
    if (this.context) {
      const session = await this.getSession(this.context.state.sessionID)

      session[key] = value

      await this.persistSessionData(this.context.state.sessionID, session)
    }
  }

  async flash(key : string, value : unknown) {
    if (this.context) {
      const session = await this.getSession(this.context.state.sessionID)

      session['_flash'][key] = value

      await this.persistSessionData(this.context.state.sessionID, session)
    }
  }

  async has(key : string) {
    if (this.context) {
      const session = await this.getSession(this.context.state.sessionID)

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
