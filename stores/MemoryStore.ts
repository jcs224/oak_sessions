export default class MemoryStore {
  private data: any

  constructor() {
    this.data = new Map
  }

  getSessionById(sessionId: string) {
    return this.data.get(sessionId)
  }

  createSession(sessionId: string) {
    this.data.set(sessionId, new Map)
  }

  getSessionVariable(sessionId: string, variableKey: string) {
    const session = this.data.get(sessionId)
    return session.get(variableKey)
  }

  setSessionVariable(sessionId: string, variableKey: string, variableValue: string) {
    const session = this.data.get(sessionId)
    session.set(variableKey, variableValue)
  }

  deleteSessionVariable(sessionId: string, variableKey: string) {
    const session = this.data.get(sessionId)
    session.delete(variableKey)
  }

  deleteSession(sessionId: string) {
    this.data.delete(sessionId)
  }
}