import { encryptCryptoJSAES, decryptCryptoJSAES, decryptFromBase64, encryptToBase64 } from '../crypto.ts';
import type { Context, CookiesGetOptions, CookiesSetDeleteOptions } from '../../deps.ts'
import type { SessionData } from '../Session.ts'

interface CookieStoreOptions {
  cookieGetOptions?: CookiesGetOptions;
  cookieSetDeleteOptions?: CookiesSetDeleteOptions;
  sessionDataCookieName?: string
}

export default class CookieStore {
  encryptionKey: string | Uint8Array

  cookieGetOptions: CookiesGetOptions;
  cookieSetDeleteOptions: CookiesSetDeleteOptions;
  sessionDataCookieName: string;

  constructor(encryptionKey : string | Uint8Array, options? : CookieStoreOptions) {
    this.encryptionKey = encryptionKey

    this.cookieGetOptions = options?.cookieGetOptions ?? {}
    this.cookieSetDeleteOptions = options?.cookieSetDeleteOptions ?? {}
    this.sessionDataCookieName = options?.sessionDataCookieName ?? 'session_data'
  }

  async getSessionByCtx(ctx : Context) : Promise<SessionData | null> {
    const sessionDataString : string | undefined = await ctx.cookies.get(this.sessionDataCookieName, this.cookieGetOptions)

    if (!sessionDataString) return null;

    try {
      let decryptedCookie

      if (typeof this.encryptionKey == 'string') {
        decryptedCookie = await decryptCryptoJSAES(sessionDataString, this.encryptionKey)
      } else {
        decryptedCookie = await decryptFromBase64(this.encryptionKey, sessionDataString)
      }

      return JSON.parse(decryptedCookie)
    } catch {
      return null
    }

  }

  async createSession(ctx : Context, initialData : SessionData) {
    const dataString = JSON.stringify(initialData)
    let encryptedCookie

    if (typeof this.encryptionKey == 'string') {
      encryptedCookie = await encryptCryptoJSAES(dataString, this.encryptionKey)
    } else {
      encryptedCookie = await encryptToBase64(this.encryptionKey, dataString)
    }
    await ctx.cookies.set(this.sessionDataCookieName, encryptedCookie, this.cookieSetDeleteOptions)
  }

  deleteSession(ctx : Context) {
    ctx.cookies.delete(this.sessionDataCookieName, this.cookieSetDeleteOptions)
  }

  async persistSessionData(ctx : Context, data : SessionData) {
    const dataString = JSON.stringify(data)
    let encryptedCookie

    if (typeof this.encryptionKey == 'string') {
      encryptedCookie = await encryptCryptoJSAES(dataString, this.encryptionKey)
    } else {
      encryptedCookie = await encryptToBase64(this.encryptionKey, dataString)
    }

    await ctx.cookies.set(this.sessionDataCookieName, encryptedCookie, this.cookieSetDeleteOptions)
  }
}
