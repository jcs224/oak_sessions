import Session from '../Session.js'
import { getCookies } from "https://deno.land/std@0.93.0/http/cookie.ts";

export default class OpineSession extends Session {
  constructor(opineApp, options = {}, store) {
    super(store || null)

    opineApp.use(async (req, res, next) => {
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