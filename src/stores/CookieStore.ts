import CryptoJS from 'https://cdn.skypack.dev/crypto-js@4.1.1'
import Store from './Store.ts'
import { Context } from 'https://deno.land/x/oak@v9.0.0/context.ts'

export default class CookieStore implements Store{
  data: Object
  encryptionKey: string | null
  context : Context | null

  constructor(encryptionKey : string | null = null) {
    this.data = {}
    this.encryptionKey = encryptionKey
    this.context = null
  }

  async insertSessionMiddlewareContext(ctx : Context) {
    this.context = ctx

    const sessionDataString : string | undefined = await this.context.cookies.get('session_data')

    if (await this.sessionExists()) {
      if (this.encryptionKey) {
        const rawString = sessionDataString
        let bytes = CryptoJS.AES.decrypt(rawString, this.encryptionKey)
        let decryptedCookie : string = ''

        try {
          decryptedCookie = bytes.toString(CryptoJS.enc.Utf8)
        } catch (e) {
          this.data = {}
        }
        
        if (decryptedCookie) {
          try {
            this.data = JSON.parse(decryptedCookie)
          } catch (e) {
            this.data = {}
          }
        }
      } else {
        try {
          this.data = typeof sessionDataString == 'string' ? JSON.parse(sessionDataString) : {}
        } catch (e) {
          this.data = {}
        }
      }
    }
  }

  async sessionExists() {
    return await this.context?.cookies.get('session_data') ? true : false
  }

  async getSessionById() {
    return await this.context?.cookies.get('session_data') ? this.data : null
  }

  createSession(id : string, initialData : Object) {
    this.data = initialData
  }

  async deleteSession(ctx : Context) {
    await ctx.cookies.delete('session_data')
  }

  persistSessionData(id : string, sessionData : any) {
    this.data = sessionData
  }

  async afterMiddlewareHook() {
    if (this.encryptionKey) {
      let cipherText = CryptoJS.AES.encrypt(JSON.stringify(this.data), this.encryptionKey).toString()
      await this.context?.cookies.set('session_data', cipherText)
    } else {
      await this.context?.cookies.set('session_data', JSON.stringify(this.data))
    }
  }
}