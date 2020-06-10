import { SessionData } from "../mod.ts";

export default function use(session: any) {
	return async (context: any, next: any) => {
		const sid = context.cookies.get("sid");
		
		if (sid === undefined) {
			context.state.session = new SessionData(session);
			context.cookies.set("sid", context.state.session.sessionId);
		} else if(session._store.sessionExists(sid) === false) {
			context.state.session = new SessionData(session);
			context.cookies.set("sid", context.state.session.sessionId);
		} else {
			context.state.session = new SessionData(session, sid);
		}
		
		await context.state.session.init();
	
		await next();
	}
}