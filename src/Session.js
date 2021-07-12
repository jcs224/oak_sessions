import { v4 } from "https://deno.land/std@0.93.0/uuid/mod.ts"
import MemoryStore from './stores/MemoryStore.js'
import { AES } from 'https://deno.land/x/god_crypto@v1.4.10/aes.ts'
import randomstring from 'https://esm.sh/randomstring@1.2.1'
import { decodeString } from 'https://deno.land/std@0.100.0/encoding/hex.ts'

export default class Session {
  constructor (oakApp, store = null, encryptionKey = null) {
    this.store = store || new MemoryStore
    this.encryptionKey = encryptionKey

    oakApp.use(async (ctx, next) => {
      let sid = ctx.cookies.get('session')

      if (sid && this.encryptionKey) {
        sid = await this._decryptSessionID(sid)
      }

      if (sid && await this.sessionExists(sid)) {
        ctx.state.session = this.getSession(sid)
      } else {
        ctx.state.session = await this.createSession()

        if (encryptionKey) {
          const encryptedID = await this._encryptSessionID(ctx.state.session.id)
          ctx.cookies.set('session', encryptedID)
        } else {
          ctx.cookies.set('session', ctx.state.session.id)
        }
      }

      ctx.state.session.set('_flash', {})

      await next();
    })
  }

  async _encryptSessionID(id) {
    const randomIV = randomstring.generate(16)
    const aes = new AES(this.encryptionKey, {
      mode: 'cbc',
      iv: randomIV
    })
    const cipher = await aes.encrypt(id)
    return randomIV + cipher.hex()
  }

  async _decryptSessionID(id) {
    const aes = new AES(this.encryptionKey, {
      mode: 'cbc',
      iv: id.substring(0, 16)
    })

    const cipher = decodeString(id.substring(16))
    const plain = await aes.decrypt(cipher)
    return plain.toString()
  }

  async sessionExists(id) {
    return await this.store.sessionExists(id)
  }

  async createSession() {
    this.id = v4.generate()
    await this.store.createSession(this.id)
    return this
  }

  getSession(id) {
    this.id = id
    return this
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