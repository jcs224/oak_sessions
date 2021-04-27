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
    await fetch(this.url + '/SET/' + this.keyPrefix + sessionId + '/{}')
  }

  async getSessionVariable(sessionId, variableKey) {
    const session = await this.getSessionById(sessionId)
    return session[variableKey]
  }

  async setSessionVariable(sessionId, variableKey, variableValue) {
    const session = await this.getSessionById(sessionId)
    session[variableKey] = variableValue
    await fetch(this.url + '/SET/' + this.keyPrefix + sessionId + '/' + encodeURI(JSON.stringify(session)))
  }
}