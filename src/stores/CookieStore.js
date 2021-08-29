import CryptoJS from 'https://cdn.skypack.dev/crypto-js@4.1.1'

export default class CookieStore {
  constructor(encryptionKey = null) {
    this.data = {}
    this.encryptionKey = encryptionKey
  }

  insertSessionMiddlewareContext(ctx) {
    this.context = ctx

    if (this.sessionExists()) {
      if (this.encryptionKey) {
        let bytes = CryptoJS.AES.decrypt(this.context.cookies.get('session_data'), this.encryptionKey)
        let decryptedCookie = bytes.toString(CryptoJS.enc.Utf8)
        this.data = JSON.parse(decryptedCookie)
      } else {
        this.data = JSON.parse(ctx.cookies.get('session_data'))
      }
    }
  }

  sessionExists() {
    return this.context.cookies.get('session_data')
  }

  getSessionById() {
    return this.data
  }

  createSession() {
    this.data = {}
  }

  deleteSession(ctx) {
    ctx.cookies.delete('session_data')
  }

  persistSessionData(id, sessionData) {
    this.data = sessionData
  }

  afterMiddlewareHook() {
    if (this.encryptionKey) {
      let cipherText = CryptoJS.AES.encrypt(JSON.stringify(this.data), this.encryptionKey).toString()
      this.context.cookies.set('session_data', cipherText)
    } else {
      this.context.cookies.set('session_data', JSON.stringify(this.data))
    }
  }
}