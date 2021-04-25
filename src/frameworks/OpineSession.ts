import Session from '../Session.ts'
import { Cookie, getCookies } from "https://deno.land/std@0.93.0/http/cookie.ts";

interface CookieOptions extends Omit<Cookie, "value" | "name"> {}

export default class OpineSession extends Session {
  private opineApp: any

  constructor(opineApp: any, options: CookieOptions = {}, store?: any) {
    super(store || null)

    opineApp.use(async (req: any, res: any, next: any) => {
      const { sid } = getCookies(req);

      // if (req.url == '/favicon.ico') {
      //   await next()
      // }

      if (!options.secure) {
        options.secure = req.protocol === "https" ? true : false;
      }
      if (!options.path) {
        options.path = "/";
      }

      if (sid && await this.sessionExists(sid)) {
        req.session = this.getSession(sid)
      } else {
        req.session = await this.createSession()
        res.cookie('sid', req.session.id)
      }

      await next()
    })
  }
}