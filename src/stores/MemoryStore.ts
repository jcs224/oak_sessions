import Store from './Store.ts'
import { Redis } from 'https://deno.land/x/redis@v0.22.2/mod.ts'
import { SessionData } from '../Session.ts'

export default class MemoryStore implements Store {
  data: Map<string, SessionData>

  constructor() {
    this.data = new Map
  }

  sessionExists(sessionId : string) {
    return this.data.has(sessionId)
  }

  getSessionById(sessionId : string) {
    return this.data.has(sessionId) ? this.data.get(sessionId)! : null
  }

  createSession(sessionId : string, initialData : SessionData) {
    this.data.set(sessionId, initialData)
  }

  deleteSession(sessionId : string) {
    this.data.delete(sessionId)
  }

  persistSessionData(sessionId : string, sessionData : SessionData) {
    this.data.set(sessionId, sessionData)
  }
}