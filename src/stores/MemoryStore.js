export default class MemoryStore {
  constructor() {
    this.data = new Map
  }

  sessionExists(sessionId) {
    return this.data.has(sessionId)
  }

  getSessionById(sessionId) {
    return this.data.get(sessionId)
  }

  createSession(sessionId) {
    this.data.set(sessionId, {})
  }

  getSessionVariable(sessionId, variableKey) {
    const session = this.data.get(sessionId)
    return session[variableKey]
  }

  setSessionVariable(sessionId, variableKey, variableValue) {
    const session = this.data.get(sessionId)
    session[variableKey] = variableValue
  }
}