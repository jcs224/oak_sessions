import { nanoid } from 'https://deno.land/x/nanoid@v3.0.0/async.ts'
import MemoryStore from './stores/MemoryStore.ts'
import CookieStore from './stores/CookieStore.ts'
import type { Context } from '../deps.ts'
import type Store from './stores/Store.ts'
import { DateTime } from 'https://jspm.dev/luxon@2.0.2'
import type { CookiesGetOptions, CookiesSetDeleteOptions } from '../deps.ts'

interface SessionOptions {
  expireAfterSeconds?: number | null
  cookieGetOptions?: CookiesGetOptions
  cookieSetOptions?: CookiesSetDeleteOptions
}

export interface SessionData {
  _flash: Record<string, unknown>
  _accessed: string | null
  _expire: string | null
  _delete: boolean
  [key: string]: unknown
}

export default class Session {

  sid: string
  // user should interact with data using `get(), set(), flash(), has()`
  private data: SessionData
  private ctx: Context

  // construct a Session with no data and id
  // private: force user to create session in initMiddleware()
  private constructor (sid : string, data : SessionData, ctx : Context) {

    this.sid = sid
    this.data = data
    this.ctx = ctx
  }

  static initMiddleware(store: Store | CookieStore = new MemoryStore(), {
    expireAfterSeconds = null,
    cookieGetOptions = {},
    cookieSetOptions = {}
  }: SessionOptions = {}) {
  
    return async (ctx : Context, next : () => Promise<unknown>) => {
      // get sessionId from cookie
      const sid = await ctx.cookies.get('session', cookieGetOptions)
      let session: Session;

      if (sid) {
        // load session data from store
        const sessionData = store instanceof CookieStore ? await store.getSessionByCtx(ctx) : await store.getSessionById(sid)

        if (sessionData) {
          // load success, check if it's valid (not expired)
          if (this.sessionValid(sessionData)) {
            session = new Session(sid, sessionData, ctx);
            await session.reupSession(store, expireAfterSeconds);
          } else {
            // invalid session
            store instanceof CookieStore ? store.deleteSession(ctx) : await store.deleteSession(sid)
            session = await this.createSession(ctx, store, expireAfterSeconds)
          }
        } else {
          session = await this.createSession(ctx, store, expireAfterSeconds)
        }

      } else {
        session = await this.createSession(ctx, store, expireAfterSeconds)
      }

      // store session to ctx.state so user can interact (set, get) with it
      ctx.state.session = session;

      // update _access time
      session.set('_accessed', DateTime.now().setZone('UTC').toISO())
      await ctx.cookies.set('session', session.sid, cookieSetOptions)


      await next()

      // request done, push session data to store
      await session.persistSessionData(store)

      if (session.data._delete) {
        store instanceof CookieStore ? store.deleteSession(ctx) : await store.deleteSession(session.sid)
      }
    }
  }

  // should only be called in `initMiddleware()` when validating session data
  private static sessionValid(sessionData: SessionData) {
    return sessionData._expire == null || DateTime.now() < DateTime.fromISO(sessionData._expire);
  }

  // should only be called in `initMiddleware()`
  private async reupSession(store : Store | CookieStore, expiration : number | null | undefined) {
    this.data._expire = expiration ? DateTime.now().setZone('UTC').plus({ seconds: expiration }).toISO() : null
    await this.persistSessionData(store)
  }

  // should only be called in `initMiddleware()` when creating a new session
  private static async createSession(ctx : Context, store : Store | CookieStore, expiration : number | null | undefined) : Promise<Session> {
    const sessionData = {
      '_flash': {},
      '_accessed': DateTime.now().setZone('UTC').toISO(),
      '_expire': expiration ? DateTime.now().setZone('UTC').plus({ seconds: expiration }).toISO() : null,
      '_delete': false
    }

    const newID = await nanoid(21)
    store instanceof CookieStore ? await store.createSession(ctx, sessionData) : await store.createSession(newID, sessionData)

    return new Session(newID, sessionData, ctx)
  }

  // set _delete to true, will be deleted in middleware
  // should be called by user using `ctx.state.session.deleteSession()`
  async deleteSession() : Promise<void> {
    this.data._delete = true
  }

  // push current session data to Session.store
  // ctx is needed for CookieStore
  private persistSessionData(store : Store | CookieStore): Promise<void> | void {
    return store instanceof CookieStore ? store.persistSessionData(this.ctx, this.data) : store.persistSessionData(this.sid, this.data)
  }

  // Methods exposed for users to manipulate session data

  get(key : string) {
    if (key in this.data) {
      return this.data[key]
    } else {
      const value = this.data['_flash'][key]
      delete this.data['_flash'][key]
      return value
    }
  }

  set(key : string, value : unknown) {
    if(value === null || value === undefined) {
      delete this.data[key]
    } else {
      this.data[key] = value
    }
  }

  flash(key : string, value : unknown) {
    this.data['_flash'][key] = value
  }

  has(key : string) {
    return key in this.data || key in this.data['_flash'];
  }
}
