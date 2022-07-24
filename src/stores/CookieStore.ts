import { encryptCryptoJSAES, decryptCryptoJSAES } from '../crypto.ts';
import type { Context, CookiesGetOptions, CookiesSetDeleteOptions } from '../../deps.ts'
import type { SessionData } from '../Session.ts'

interface CookieStoreOptions {
  cookieGetOptions?: CookiesGetOptions;
  cookieSetDeleteOptions?: CookiesSetDeleteOptions;
}

export default class CookieStore {
  encryptionKey: string | null

  cookieGetOptions: CookiesGetOptions;
  cookieSetDeleteOptions: CookiesSetDeleteOptions;

  constructor(encryptionKey : string | null = null, options? : CookieStoreOptions) {
    this.encryptionKey = encryptionKey

    this.cookieGetOptions = options?.cookieGetOptions ?? {}
    this.cookieSetDeleteOptions = options?.cookieSetDeleteOptions ?? {}
  }

  async getSessionByCtx(ctx : Context) : Promise<SessionData | null> {
    const sessionDataString : string | undefined = await ctx.cookies.get('session_data', this.cookieGetOptions)

    if (!sessionDataString) return null;

    if (this.encryptionKey) {
      const rawString = sessionDataString
      const decryptedCookie = await decryptCryptoJSAES(rawString, this.encryptionKey)

      try {
        return JSON.parse(decryptedCookie)
      } catch (_e) {
        return null
      }
        
    } else {
      try {
        return typeof sessionDataString === 'string' ? JSON.parse(sessionDataString) : null
      } catch (_e) {
        return null
      }
    }
  }

  async createSession(ctx : Context, initialData : SessionData) {
    let dataString = JSON.stringify(initialData)

    if (this.encryptionKey)
      dataString = await encryptCryptoJSAES(dataString, this.encryptionKey)
    await ctx.cookies.set('session_data', dataString, this.cookieSetDeleteOptions)
  }

  deleteSession(ctx : Context) {
    ctx.cookies.delete('session_data', this.cookieSetDeleteOptions)
  }

  async persistSessionData(ctx : Context, data : SessionData) {
    let dataString = JSON.stringify(data)

    if (this.encryptionKey)
      dataString = await encryptCryptoJSAES(dataString, this.encryptionKey)
    await ctx.cookies.set('session_data', dataString, this.cookieSetDeleteOptions)
  }
}
