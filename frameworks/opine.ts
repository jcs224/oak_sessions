import { SessionData } from "../mod.ts";
import { Cookie, getCookies } from "https://deno.land/std/http/cookie.ts";

interface CookieOptions extends Omit<Cookie, "value" | "name"> {
}

export default function use(session: any, options: CookieOptions = {}) {
  return async (req: any, res: any, next: any) => {
    const { sid } = getCookies(req);

    if (!options.secure) {
      options.secure = req.protocol === "https" ? true : false;
    }
    if (!options.path) {
      options.path = "/";
    }

    if (sid === undefined) {
      req.session = new SessionData(session);
      res.cookie("sid", req.session.sessionId, options);
    } else if (session._store.sessionExists(sid) === false) {
      req.session = new SessionData(session);
      res.cookie("sid", req.session.sessionId, options);
    } else {
      req.session = new SessionData(session, sid);
    }

    await req.session.init();

    next();
  };
}
