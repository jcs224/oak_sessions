import { IStore } from "./interface.ts";

export default class MemoryStore implements IStore {
	
	private _sessionMemoryStore: any;
	
	constructor(options: any) {
		this._sessionMemoryStore = {};
	}
	
	public async init() { }
	
	public async sessionExists(sessionId: string) : Promise<boolean> {
		if(Object.keys(this._sessionMemoryStore).includes(sessionId)) {
			return true;
		} else {
			return false;
		}
	}
	
	public async getSessionById(sessionId: string) : Promise<any> {
		return this._sessionMemoryStore[sessionId];
	}
	
	public async createSession(sessionId: string) : Promise<void> {
		this._sessionMemoryStore[sessionId] = {};
	}
	
	public async setSessionVariable(sessionId: any, sessionVariableKey: any, sessionVariableValue: any) : Promise<void> {
		this._sessionMemoryStore[sessionId][sessionVariableKey] = sessionVariableValue;
	}
	
	public async deleteSession(sessionId: any) : Promise<void> {
		delete this._sessionMemoryStore[sessionId];
	}
}