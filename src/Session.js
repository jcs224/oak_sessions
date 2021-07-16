import { nanoid } from 'https://deno.land/x/nanoid@v3.0.0/async.ts'
import MemoryStore from './stores/MemoryStore.js'
import { AES } from 'https://deno.land/x/god_crypto@v1.4.10/aes.ts'
import randomstring from 'https://jspm.dev/randomstring@1.2.1'
import { decodeString } from 'https://deno.land/std@0.100.0/encoding/hex.ts'
import { parseFormParams } from "./Helpers.js"

export default class Session {
  constructor (oakApp, store = null) {
    this.store = store || new MemoryStore

    oakApp.use(async (ctx, next) => {
      const params = await parseFormParams(ctx)

      if (params.get('_skipSession') !== 'true') {
        const sid = ctx.cookies.get('session')

        if (sid && await this.sessionExists(sid)) {
          ctx.state.session = this.getSession(sid)
        } else {
          ctx.state.session = await this.createSession()
          ctx.cookies.set('session', ctx.state.session.id)
        }

        ctx.state.session.set('_flash', {})
      }

      await next()
    })
  }

  async sessionExists(id) {
    return await this.store.sessionExists(id)
  }

  async createSession() {
    this.id = await nanoid()
    await this.store.createSession(this.id)
    return this
  }

  getSession(id) {
    this.id = id
    return this
  }

  async deleteSession() {
    await this.store.deleteSession(this.id)
  }

  async get(key) {
    const session = await this.store.getSessionById(this.id)

    if (session.hasOwnProperty(key)) {
      return session[key]
    } else {
      return session['_flash'][key]
    }
  }

  async set(key, value) {
    const session = await this.store.getSessionById(this.id)
    session[key] = value
    await this.store.persistSessionData(this.id, session)
  }

  async flash(key, value) {
    const session = await this.store.getSessionById(this.id)
    session['_flash'][key] = value
    await this.store.persistSessionData(this.id, session)
  }

  async has(key) {
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
  }
}