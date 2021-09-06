import Store from './Store.ts'
import { Redis } from 'https://deno.land/x/redis@v0.22.2/mod.ts'

export default class MemoryStore implements Store {
  data: Map<string, unknown>

  constructor() {
    this.data = new Map
  }

  sessionExists(sessionId : string) {
    return this.data.has(sessionId)
  }

  getSessionById(sessionId : string) {
    return this.data.get(sessionId)
  }

  createSession(sessionId : string) {
    this.data.set(sessionId, {
      '_flash': {}
    })
  }

  deleteSession(sessionId : string) {
    this.data.delete(sessionId)
  }

  persistSessionData(sessionId : string, sessionData : Object) {
    this.data.set(sessionId, sessionData)
  }
}