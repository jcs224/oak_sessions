import Session from '../lib/Session.ts'

export default class OakSession extends Session {
  private oakApp: any

  constructor(oakApp: any, store?: any) {
    super(store || null)
    
    oakApp.use(async (ctx : any, next : any) => {
      const sid = ctx.cookies.get('sid')

      if (sid) {
        ctx.state.session = this.sessionData.getSession(sid)
      } else {
        const newId = this.sessionData.createSession()
        ctx.state.session = this.sessionData.getSession(newId)
        ctx.cookies.set('sid', newId)
      }

      await next();
    })
  }
}