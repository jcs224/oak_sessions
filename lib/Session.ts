import SessionData from './SessionData.ts'

export default abstract class Session {
  protected sessionData: any

  constructor(store?: any) {
    this.sessionData = new SessionData(store)
  }
}