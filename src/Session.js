import { v4 } from "https://deno.land/std@0.93.0/uuid/mod.ts"
import MemoryStore from './stores/MemoryStore.js'

export default class Session {
  constructor (store = null) {
    this.store = store || new MemoryStore
  }

  async sessionExists(id) {
    return await this.store.sessionExists(id)
  }

  async createSession() {
    this.id = v4.generate()
    await this.store.createSession(this.id)
    return this
  }

  getSession(id) {
    this.id = id
    return this
  }

  async get(key) {
    return await this.store.getSessionVariable(this.id, key)
  }

  async set(key, value) {
    await this.store.setSessionVariable(this.id, key, value)
  }
}