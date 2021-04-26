export default class WebdisStore {
  private url: string
  private keyPrefix: string

  constructor(options: any) {
    this.url = options.url
    this.keyPrefix = options.keyPrefix || 'session_'
  }

  async sessionExists(sessionId: string) {
    const payload = await fetch(this.url + '/GET/' + this.keyPrefix + sessionId)
    const payloadJSON = await payload.json()
    const session = payloadJSON.GET
    return session ? true : false
  }

  async getSessionById(sessionId: string) {
    const payload = await fetch(this.url + '/GET/' + this.keyPrefix + sessionId)
    const payloadJSON = await payload.json()
    const session = JSON.parse(payloadJSON.GET)
    return session
  }

  async createSession(sessionId: string) {
    await fetch(this.url + '/SET/' + this.keyPrefix + sessionId + '/{}')
  }

  async getSessionVariable(sessionId: string, variableKey: string) {
    const session = await this.getSessionById(sessionId)
    return session[variableKey]
  }

  async setSessionVariable(sessionId: string, variableKey: string, variableValue: string) {
    const session = await this.getSessionById(sessionId)
    session[variableKey] = variableValue
    await fetch(this.url + '/SET/' + this.keyPrefix + sessionId + '/' + encodeURI(JSON.stringify(session)))
  }
}