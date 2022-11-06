import { encryptCryptoJSAES, decryptCryptoJSAES } from '../crypto.ts';
import type { Context, CookiesGetOptions, CookiesSetDeleteOptions } from '../../deps.ts'
import type { SessionData } from '../Session.ts'

interface CookieStoreOptions {
  cookieGetOptions?: CookiesGetOptions;
  cookieSetDeleteOptions?: CookiesSetDeleteOptions;
  sessionDataCookieName?: string
}

export default class CookieStore {
  encryptionKey: string

  cookieGetOptions: CookiesGetOptions;
  cookieSetDeleteOptions: CookiesSetDeleteOptions;
  sessionDataCookieName: string;

  constructor(encryptionKey : string, options? : CookieStoreOptions) {
    this.encryptionKey = encryptionKey

    this.cookieGetOptions = options?.cookieGetOptions ?? {}
    this.cookieSetDeleteOptions = options?.cookieSetDeleteOptions ?? {}
    this.sessionDataCookieName = options?.sessionDataCookieName ?? 'session_data'
  }

  async getSessionByCtx(ctx : Context) : Promise<SessionData | null> {
    const sessionDataString : string | undefined = await ctx.cookies.get(this.sessionDataCookieName, this.cookieGetOptions)

    if (!sessionDataString) return null;

    try {
      const decryptedCookie = await decryptCryptoJSAES(sessionDataString, this.encryptionKey)
      return JSON.parse(decryptedCookie)
    } catch {
      return null
    }

  }

  async createSession(ctx : Context, initialData : SessionData) {
    const dataString = JSON.stringify(initialData)

    const encryptedCookie = await encryptCryptoJSAES(dataString, this.encryptionKey)
    await ctx.cookies.set(this.sessionDataCookieName, encryptedCookie, this.cookieSetDeleteOptions)
  }

  deleteSession(ctx : Context) {
    ctx.cookies.delete(this.sessionDataCookieName, this.cookieSetDeleteOptions)
  }

  async persistSessionData(ctx : Context, data : SessionData) {
    const dataString = JSON.stringify(data)

    const encryptedCookie = await encryptCryptoJSAES(dataString, this.encryptionKey)
    await ctx.cookies.set(this.sessionDataCookieName, encryptedCookie, this.cookieSetDeleteOptions)
  }
}
