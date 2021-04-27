import Session from '../Session.js'

export default class OakSession extends Session {
  constructor(oakApp, store = null) {
    super(store || null)

    oakApp.use(async (ctx, next) => {
      const sid = ctx.cookies.get('sid')

      if (sid && await this.sessionExists(sid)) {
        ctx.state.session = this.getSession(sid)
      } else {
        ctx.state.session = await this.createSession()
        ctx.cookies.set('sid', ctx.state.session.id)
      }

      await next();
    })
  }
}