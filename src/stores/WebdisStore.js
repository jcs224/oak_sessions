export default class WebdisStore {
  constructor(options) {
    this.url = options.url
    this.keyPrefix = options.keyPrefix || 'session_'
  }

  async sessionExists(sessionId) {
    const payload = await fetch(this.url + '/GET/' + this.keyPrefix + sessionId)
    const payloadJSON = await payload.json()
    const session = payloadJSON.GET
    return session ? true : false
  }

  async getSessionById(sessionId) {
    const payload = await fetch(this.url + '/GET/' + this.keyPrefix + sessionId)
    const payloadJSON = await payload.json()
    const session = JSON.parse(payloadJSON.GET)
    return session
  }

  async createSession(sessionId) {
    await fetch(this.url + '/SET/' + this.keyPrefix + sessionId + '/'+JSON.stringify({
      '_flash': {}
    }))
  }

  async deleteSession(sessionId) {
    await fetch(this.url + '/DEL/' + this.keyPrefix + sessionId)
  }

  async persistSessionData(sessionId, sessionData) {
    await fetch(this.url + '/SET/' + this.keyPrefix + sessionId + '/' + encodeURI(JSON.stringify(sessionData)))
  }
}