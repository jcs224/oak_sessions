export default class CookieStore {
  constructor(encryptionKey = null) {
    this.data = {}
    this.encryptionKey = encryptionKey
  }
}