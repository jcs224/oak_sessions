import { Context } from 'https://deno.land/x/oak@v9.0.0/context.ts'

export default interface Store {
  sessionExists(sessionId?: string) : Promise<boolean> | boolean
  getSessionById(sessionId?: string) : Promise<any> | any
  createSession(sessionId?: string) : Promise<void> | void
  persistSessionData(sessionId: string, sessionData: Object) : Promise<void> | void
  deleteSession(sessionIdOrContext: string | Context) : Promise<void> | void
  insertSessionMiddlewareContext?(context : any) : Promise<void> | void
  afterMiddlewareHook?() : Promise<void> | void
}