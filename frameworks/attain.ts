import { SessionData } from "../mod.ts";
import {
	Request,
	Response
} from "https://deno.land/x/attain/mod.ts";
import { Cookie, setCookie, getCookies } from "https://deno.land/std/http/cookie.ts";

interface CookieOptions extends Omit<Cookie, "value" | "name"> {

}

export default function use(session: any, options?: CookieOptions) {
	return async (req: Request, res: Response) => {
		const cookies = getCookies(req.serverRequest);
		const sid = cookies.sid

		const opt: CookieOptions = options || {};

		// set default cookie options
		if (!opt.secure) {
			req.url.protocol === "http:" ? opt.secure = false : opt.secure = true
		}
		if (!opt.path) {
			opt.path = "/"
		}
		if (!opt.httpOnly) {
			req.url.protocol === "http:" ? opt.httpOnly = true : opt.httpOnly = false
		}


		if (sid === undefined) {
			req.session = new SessionData(session);
		} else if (session._store.sessionExists(sid) === false) {
			req.session = new SessionData(session);
		} else {
			req.session = new SessionData(session, sid ? sid : undefined);
		}

		await req.session.init();

		// This pended job will be executed right before send back to the client to save a cookie in response.
		res.pend((req, res) => {
			const cookie: Cookie = { name: "sid", value: req.session.sessionId, ...opt }
			setCookie(res.getResponse, cookie);
		})

	}
}