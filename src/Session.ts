import { nanoid } from 'https://deno.land/x/nanoid@v3.0.0/async.ts'
import MemoryStore from './stores/MemoryStore.ts'
import CookieStore from './stores/CookieStore.ts'
import { Context } from '../deps.ts'
import Store from './stores/Store.ts'
import { DateTime } from 'https://jspm.dev/luxon@2.0.2'
import type { CookiesGetOptions, CookiesSetDeleteOptions } from '../deps.ts'

interface SessionOptions {
  expireAfterSeconds?: number
  cookieGetOptions?: CookiesGetOptions
  cookieSetOptions?: CookiesSetDeleteOptions
}

export interface SessionData {
  _flash: Record<string, unknown>
  _accessed: string | null
  _expire: string | null
  [key: string]: unknown
}

export default class Session {
  context: Context | null
  store: Store
  expiration: number | null
  cookieSetOptions: CookiesSetDeleteOptions
  cookieGetOptions: CookiesGetOptions

  constructor (store : Store = new MemoryStore, options? : SessionOptions) {
    this.context = null
    this.store = store
    this.expiration = options && options.expireAfterSeconds ? options.expireAfterSeconds : null
    this.cookieGetOptions = options?.cookieGetOptions ?? {}
    this.cookieSetOptions = options?.cookieSetOptions ?? {}
  }

  initMiddleware() {
    return async (ctx : Context, next : () => Promise<unknown>) => {
      this.context = ctx

      if (typeof this.store.insertSessionMiddlewareContext !== 'undefined') {
        await this.store.insertSessionMiddlewareContext(ctx)
      }

      const sid = await ctx.cookies.get('session', this.cookieGetOptions)
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

      await this.set('_accessed', DateTime.now().setZone('UTC').toISO())
      await this.set('_flash', {})
      await ctx.cookies.set('session', ctx.state.sessionID, this.cookieSetOptions)

      await next()

      await this.persistSessionData(
        ctx.state.sessionID, 
        await this.getSession(ctx.state.sessionID) as SessionData, 
        true
      )

      if (typeof this.store.afterMiddlewareHook !== 'undefined') {
        await this.store.afterMiddlewareHook()
      }
    }
  }

  async sessionValid(id : string) {
    const session = await this.getSession(id) as SessionData

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
    const session = await this.getSession(id) as SessionData
    session._expire = this.expiration ? DateTime.now().setZone('UTC').plus({ seconds: this.expiration }).toISO() : null
    await this.persistSessionData(id, session)
  }

  async createSession() {
    const session = {
      '_flash': {},
      '_accessed': DateTime.now().setZone('UTC').toISO(),
      '_expire': this.expiration ? DateTime.now().setZone('UTC').plus({ seconds: this.expiration }).toISO() : null
    }

    const newID = await nanoid(21)
    await this.store.createSession(newID, session)
    if (this.context) this.context.state.sessionCache = session

    return newID
  }

  async getSession(id : string, pullFromStore : boolean = false): Promise<SessionData | null> {
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

  async deleteSession(sessionIdOrContext? : string | Context) {
    if (sessionIdOrContext) {
      if (typeof sessionIdOrContext == 'string') {
        let sessionId = sessionIdOrContext
        await this.store.deleteSession(sessionId)
        if (this.context) this.context.state.sessionCache = null
      } else {
        let ctx = sessionIdOrContext
  
        if (sessionIdOrContext instanceof Context) {
          const sessionID : string | undefined = await ctx.cookies.get('session', this.cookieGetOptions)
          if (sessionID) {
            if (this.context) this.context.state.sessionCache = null
          }
        }
  
        if (sessionIdOrContext instanceof Context && this.store instanceof CookieStore) {
          await this.store.deleteSession(ctx)
        } else {
          const sessionID : string | undefined = await ctx.cookies.get('session', this.cookieGetOptions)
          if (typeof sessionID == 'string') {
            await this.store.deleteSession(sessionID)
          }
        }
      }
    } else {
      if (this.context instanceof Context && this.context.state.sessionID) {
        await this.store.deleteSession(this.context.state.sessionID)
      }
    }

    if (this.context instanceof Context) {
      await this.context.cookies.delete('session', this.cookieSetOptions)
    }
  }

  async persistSessionData(id : string, data: SessionData, pushToStore : boolean = false) {
    if (this.context) this.context.state.sessionCache = data

    if (pushToStore) {
      await this.store.persistSessionData(id, data)
    }
  }

  async get(key : string) {
    if (this.context) {
      const session = await this.getSession(this.context.state.sessionID) as SessionData

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
      const session = await this.getSession(this.context.state.sessionID) as SessionData

      session[key] = value

      await this.persistSessionData(this.context.state.sessionID, session)
    }
  }

  async flash(key : string, value : unknown) {
    if (this.context) {
      const session = await this.getSession(this.context.state.sessionID) as SessionData

      session['_flash'][key] = value

      await this.persistSessionData(this.context.state.sessionID, session)
    }
  }

  async has(key : string) {
    if (this.context) {
      const session = await this.getSession(this.context.state.sessionID) as SessionData

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
