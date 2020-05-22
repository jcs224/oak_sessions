interface IStore {
	init() : Promise<void>;
	sessionExists(sessionId: string) : Promise<boolean>;
	getSessionById(sessionId: string) : Promise<any>;
	createSession(sessionId: string) : Promise<void>;
	setSessionVariable(sessionId: any, sessionVariableKey: any, sessionVariableValue: any) : Promise<void>;
	deleteSession(sessionId: any) : Promise<void>;
}