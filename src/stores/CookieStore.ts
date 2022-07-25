import { encryptCryptoJSAES, decryptCryptoJSAES } from '../crypto.ts';
import type { Context, CookiesGetOptions, CookiesSetDeleteOptions } from '../../deps.ts'
import type { SessionData } from '../Session.ts'

interface CookieStoreOptions {
  cookieGetOptions?: CookiesGetOptions;
  cookieSetDeleteOptions?: CookiesSetDeleteOptions;
}

export default class CookieStore {
  encryptionKey: string

  cookieGetOptions: CookiesGetOptions;
  cookieSetDeleteOptions: CookiesSetDeleteOptions;

  constructor(encryptionKey : string, options? : CookieStoreOptions) {
    this.encryptionKey = encryptionKey

    this.cookieGetOptions = options?.cookieGetOptions ?? {}
    this.cookieSetDeleteOptions = options?.cookieSetDeleteOptions ?? {}
  }

  async getSessionByCtx(ctx : Context) : Promise<SessionData | null> {
    const sessionDataString : string | undefined = await ctx.cookies.get('session_data', this.cookieGetOptions)

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
    await ctx.cookies.set('session_data', encryptedCookie, this.cookieSetDeleteOptions)
  }

  deleteSession(ctx : Context) {
    ctx.cookies.delete('session_data', this.cookieSetDeleteOptions)
  }

  async persistSessionData(ctx : Context, data : SessionData) {
    const dataString = JSON.stringify(data)

    const encryptedCookie = await encryptCryptoJSAES(dataString, this.encryptionKey)
    await ctx.cookies.set('session_data', encryptedCookie, this.cookieSetDeleteOptions)
  }
}
