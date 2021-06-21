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
    this.data.set(sessionId, {
      '_flash': {}
    })
  }

  getSessionVariable(sessionId, variableKey) {
    const session = this.data.get(sessionId)

    if (session.hasOwnProperty(variableKey)) {
      return session[variableKey]
    } else {
      return session['_flash'][variableKey]
    }
  }

  setSessionVariable(sessionId, variableKey, variableValue) {
    const session = this.data.get(sessionId)
    session[variableKey] = variableValue
  }

  flashSessionVariable(sessionId, variableKey, variableValue) {
    const session = this.data.get(sessionId)
    session['_flash'][variableKey] = variableValue
  }
}