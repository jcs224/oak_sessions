import Store from './Store.ts'

type WebdisOptions = {
  url : string,
  keyPrefix: string,
}

export default class WebdisStore implements Store {
  url: string
  keyPrefix: string

  constructor(options : WebdisOptions) {
    this.url = options.url
    this.keyPrefix = options.keyPrefix || 'session_'
  }

  async sessionExists(sessionId : string) {
    const payload = await fetch(this.url + '/GET/' + this.keyPrefix + sessionId)
    const payloadJSON = await payload.json()
    const session = payloadJSON.GET
    return session ? true : false
  }

  async getSessionById(sessionId : string) {
    const payload = await fetch(this.url + '/GET/' + this.keyPrefix + sessionId)
    const payloadJSON = await payload.json()
    const session = JSON.parse(payloadJSON.GET)
    return session
  }

  async createSession(sessionId : string) {
    await fetch(this.url + '/SET/' + this.keyPrefix + sessionId + '/'+JSON.stringify({
      '_flash': {}
    }))
  }

  async deleteSession(sessionId : string) {
    await fetch(this.url + '/DEL/' + this.keyPrefix + sessionId)
  }

  async persistSessionData(sessionId : string, sessionData : Object) {
    await fetch(this.url + '/SET/' + this.keyPrefix + sessionId + '/' + encodeURI(JSON.stringify(sessionData)))
  }
}