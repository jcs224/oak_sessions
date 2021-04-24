export default class MemoryStore {
  private data: any

  constructor() {
    this.data = new Map
  }

  sessionExists(sessionId: string) {
    return this.data.has(sessionId)
  }

  getSessionById(sessionId: string) {
    return this.data.get(sessionId)
  }

  createSession(sessionId: string) {
    this.data.set(sessionId, {})
  }

  getSessionVariable(sessionId: string, variableKey: string) {
    const session = this.data.get(sessionId)
    return session[variableKey]
  }

  setSessionVariable(sessionId: string, variableKey: string, variableValue: string) {
    const session = this.data.get(sessionId)
    session[variableKey] = variableValue
  }
}