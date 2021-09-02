import CryptoJS from 'https://cdn.skypack.dev/crypto-js@4.1.1'

export default class CookieStore {
  constructor(encryptionKey = null) {
    this.data = {}
    this.encryptionKey = encryptionKey
  }

  async insertSessionMiddlewareContext(ctx) {
    this.context = ctx

    if (await this.sessionExists()) {
      if (this.encryptionKey) {
        const rawString = await this.context.cookies.get('session_data')
        let bytes = CryptoJS.AES.decrypt(rawString, this.encryptionKey)
        let decryptedCookie = false

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
          this.data = JSON.parse(await ctx.cookies.get('session_data'))
        } catch (e) {
          this.data = {}
        }
      }
    }
  }

  async sessionExists() {
    return await this.context.cookies.get('session_data')
  }

  getSessionById() {
    return this.data
  }

  createSession() {
    this.data = {}
  }

  async deleteSession(ctx) {
    await ctx.cookies.delete('session_data')
  }

  persistSessionData(id, sessionData) {
    this.data = sessionData
  }

  async afterMiddlewareHook() {
    if (this.encryptionKey) {
      let cipherText = CryptoJS.AES.encrypt(JSON.stringify(this.data), this.encryptionKey).toString()
      await this.context.cookies.set('session_data', cipherText)
    } else {
      await this.context.cookies.set('session_data', JSON.stringify(this.data))
    }
  }
}