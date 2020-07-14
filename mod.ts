import { v4 } from "https://deno.land/std/uuid/mod.ts";
import * as Memory from "./stores/memory.ts"
import * as Redis from "./stores/redis.ts"
import * as Interface from "./stores/interface.ts"
import * as Oak from "./frameworks/oak.ts"
import * as Attain from "./frameworks/attain.ts"

const stores: any = {
	memory: Memory,
	redis: Redis,
	interface: Interface
}

const frameworks: any = {
	oak: Oak,
	attain: Attain
}

interface ISessionOptions {
	framework: string;
	store?: string;
	hostname?: string;
	port?: number;
}

export class Session {
	
	private _frameworkLib: any;
	private _storeLib: any;
	private _options: any;
	public _store: any;
	
	constructor(options?: ISessionOptions) {
		this._options = options;
		
		if (this._options.store === undefined) {
			this._options.store = "memory"
		}
	}
	
	public async init() {
		this._storeLib = stores[this._options.store];
		this._storeLib = this._storeLib.default;
		this._store = new this._storeLib(this._options);
		await this._store.init();
		
		this._frameworkLib = frameworks[this._options.framework];
		this._frameworkLib = this._frameworkLib.default;
	}

	public use() {
		return this._frameworkLib;
	}
}

export class SessionData {
	
	private _session: any;
	public sessionId: any;
	
	constructor(session: any, sessionId?: string) {
		this._session = session;
		if (sessionId) {
			this.sessionId = sessionId;
		} else {
			this.sessionId = v4.generate();
		}
	}
	
	public async init() : Promise<void>  {
		if (await this._session._store.sessionExists(this.sessionId) === false) {
			await this._session._store.createSession(this.sessionId);
		}
	}
	
	public async get(sessionVariableKey: string) : Promise<any> {
		let sessionData = await this._session._store.getSessionById(this.sessionId);
		sessionData = sessionData[sessionVariableKey];
		return sessionData
	}
	
	public async set(sessionVariableKey: string, sessionVariableValue: string) : Promise<void> {
		await this._session._store.setSessionVariable(this.sessionId, sessionVariableKey, sessionVariableValue);
	}
}