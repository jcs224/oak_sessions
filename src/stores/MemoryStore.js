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

  persistSessionData(sessionId, sessionData) {
    this.data.set(sessionId, sessionData)
  }
}