import { SessionData } from "../mod.ts";

export default function use(session: any) {
	return async (context: any, next: any) => {
		const sid = context.cookies.get("sid");
		
		if (sid === undefined) {
			context.session = new SessionData(session);
			context.cookies.set("sid", context.session.sessionId);
		} else if(session._store.sessionExists(sid) === false) {
			context.session = new SessionData(session);
			context.cookies.set("sid", context.session.sessionId);
		} else {
			context.session = new SessionData(session, sid);
		}
		
		await context.session.init();
	
		await next();
	}
}