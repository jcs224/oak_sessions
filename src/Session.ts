import { v4 } from "https://deno.land/std@0.93.0/uuid/mod.ts"
import MemoryStore from './stores/MemoryStore.ts'

export default abstract class Session {
  public id: any
  public store: any

  constructor (store?: any) {
    this.store = store || new MemoryStore
  }

  async sessionExists(id :string) {
    return await this.store.sessionExists(id)
  }

  async createSession() {
    this.id = v4.generate()
    await this.store.createSession(this.id)
    return this
  }

  getSession(id: string) {
    this.id = id
    return this
  }

  async get(key: string) {
    return await this.store.getSessionVariable(this.id, key)
  }

  async set(key: string, value: any) {
    await this.store.setSessionVariable(this.id, key, value)
  }
}