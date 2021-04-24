import Session from '../Session.ts'

export default class OakSession extends Session {
  private oakApp: any

  constructor(oakApp: any, store?: any) {
    super(store || null)
    
    oakApp.use(async (ctx : any, next : any) => {
      const sid = ctx.cookies.get('sid')

      if (sid && this.sessionExists(sid)) {
        ctx.state.session = this.getSession(sid)
      } else {
        ctx.state.session = this.createSession()
        ctx.cookies.set('sid', ctx.state.session.id)
      }

      await next();
    })
  }
}