import type { Context } from '../../deps.ts'
import type { SessionData } from '../Session.ts'

export default interface Store {
  getSessionById(sessionId?: string) : Promise<SessionData | null> | SessionData | null
  createSession(sessionId: string, initialData: SessionData) : Promise<void> | void
  persistSessionData(sessionId: string, sessionData: SessionData) : Promise<void> | void
  deleteSession(sessionIdOrContext: string | Context) : Promise<void> | void
}
