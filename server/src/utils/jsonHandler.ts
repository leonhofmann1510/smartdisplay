import fs from 'fs'
import path from 'path'

// ─── Types ───────────────────────────────────────────────────────────────────

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonArray
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]

export type PathListener<V = unknown> = (newValue: V, oldValue: V, path: string) => void
export type Unsubscribe = () => void

export type PatchOp =
  | { op: 'set'; path: string; value: JsonValue }
  | { op: 'delete'; path: string }
  | { op: 'merge'; path: string; value: JsonObject }

export type QueryMatch = { path: string; value: JsonValue }

// ─── DB Directory ─────────────────────────────────────────────────────────────

let DB_DIR = path.join(process.cwd(), 'db')

/** Override the default db directory */
export const setDbDir = (dir: string): void => {
  DB_DIR = dir
}

// ─── JsonHandler ─────────────────────────────────────────────────────────────

export class JsonHandler<T extends JsonObject = JsonObject> {
  private data: T
  private listeners: Map<string, Set<PathListener>>
  private filePath: string | null

  constructor(initialData: T = {} as T, filePath: string | null = null) {
    this.data = this.deepClone(initialData)
    this.listeners = new Map()
    this.filePath = filePath
  }

  /**
   * Open (or create) a named JSON table in the db directory.
   * Loads existing data from disk if the file exists, otherwise
   * writes the initialData as a new file.
   */
  static async open<T extends JsonObject = JsonObject>(
    name: string,
    initialData: T = {} as T,
  ): Promise<JsonHandler<T>> {
    await fs.promises.mkdir(DB_DIR, { recursive: true })

    const filePath = path.join(DB_DIR, `${name}.json`)
    let data: T

    try {
      const raw = await fs.promises.readFile(filePath, 'utf-8')
      data = JSON.parse(raw) as T
    } catch {
      data = initialData
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    }

    return new JsonHandler<T>(data, filePath)
  }

  /** Persist current state to disk (fire-and-forget) */
  private persist(): void {
    if (!this.filePath) return
    fs.promises
      .writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
      .catch(err => console.error(`[JsonHandler] Failed to persist ${this.filePath}:`, err))
  }

  // ── Path Utilities ──────────────────────────────────────────────────────────

  private parsePath(path: string): string[] {
    if (!path || path === '.') return []
    return path.split('.').filter(Boolean)
  }

  private getByPath(obj: unknown, parts: string[]): unknown {
    let current: unknown = obj
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return undefined
      current = (current as Record<string, unknown>)[part]
    }
    return current
  }

  private setByPath(obj: Record<string, unknown>, parts: string[], value: unknown): void {
    if (parts.length === 0) return
    const last = parts[parts.length - 1]!
    let current: Record<string, unknown> = obj
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!
      if (current[part] == null || typeof current[part] !== 'object' || Array.isArray(current[part])) {
        current[part] = {}
      }
      current = current[part] as Record<string, unknown>
    }
    current[last] = value
  }

  private deleteByPath(obj: Record<string, unknown>, parts: string[]): boolean {
    if (parts.length === 0) return false
    const last = parts[parts.length - 1]!
    let current: Record<string, unknown> = obj
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!
      if (current[part] == null || typeof current[part] !== 'object') return false
      current = current[part] as Record<string, unknown>
    }
    if (!(last in current)) return false
    delete current[last]
    return true
  }

  private deepClone<V>(value: V): V {
    if (value === null || typeof value !== 'object') return value
    return JSON.parse(JSON.stringify(value))
  }

  private deepMergeObjects(target: JsonObject, source: JsonObject): JsonObject {
    const result = { ...target }
    for (const key of Object.keys(source)) {
      const srcVal = source[key]
      const tgtVal = result[key]
      if (
        srcVal !== null &&
        typeof srcVal === 'object' &&
        !Array.isArray(srcVal) &&
        tgtVal !== null &&
        typeof tgtVal === 'object' &&
        !Array.isArray(tgtVal)
      ) {
        result[key] = this.deepMergeObjects(tgtVal, srcVal)
      } else {
        result[key] = this.deepClone(srcVal)
      }
    }
    return result
  }

  private notifyListeners(path: string, newValue: unknown, oldValue: unknown): void {
    const exact = this.listeners.get(path)
    if (exact) exact.forEach(cb => cb(newValue, oldValue, path))

    const parts = this.parsePath(path)
    for (let i = parts.length - 1; i >= 0; i--) {
      const parent = parts.slice(0, i).join('.')
      const wildcardKey = parent ? `${parent}.*` : '*'
      this.listeners.get(wildcardKey)?.forEach(cb => cb(newValue, oldValue, path))
    }

    this.listeners.get('**')?.forEach(cb => cb(newValue, oldValue, path))
  }

  // ── Core CRUD ───────────────────────────────────────────────────────────────

  get(): T
  get<V = JsonValue>(path: string): V | undefined
  get<V = JsonValue>(path?: string): T | V | undefined {
    if (path == null) return this.deepClone(this.data)
    const parts = this.parsePath(path)
    if (parts.length === 0) return this.deepClone(this.data) as unknown as V
    return this.deepClone(this.getByPath(this.data, parts)) as V
  }

  set(path: string, value: JsonValue): this {
    const parts = this.parsePath(path)
    const oldValue = this.getByPath(this.data, parts)
    this.setByPath(this.data as Record<string, unknown>, parts, this.deepClone(value))
    this.notifyListeners(path, this.deepClone(value), oldValue)
    this.persist()
    return this
  }

  delete(path: string): boolean {
    const parts = this.parsePath(path)
    const oldValue = this.getByPath(this.data, parts)
    const deleted = this.deleteByPath(this.data as Record<string, unknown>, parts)
    if (deleted) {
      this.notifyListeners(path, undefined, oldValue)
      this.persist()
    }
    return deleted
  }

  has(path: string): boolean {
    return this.getByPath(this.data, this.parsePath(path)) !== undefined
  }

  // ── Bulk Operations ─────────────────────────────────────────────────────────

  merge(partial: Partial<T>): this {
    const oldData = this.deepClone(this.data)
    this.data = this.deepMergeObjects(this.data, partial as JsonObject) as T
    this.notifyListeners('**', this.deepClone(this.data), oldData)
    this.persist()
    return this
  }

  mergeAt(path: string, value: JsonObject): this {
    const parts = this.parsePath(path)
    const existing = this.getByPath(this.data, parts)
    const merged = this.deepMergeObjects(
      (existing && typeof existing === 'object' && !Array.isArray(existing) ? existing : {}) as JsonObject,
      value,
    )
    return this.set(path, merged)
  }

  replace(data: T): this {
    const oldData = this.deepClone(this.data)
    this.data = this.deepClone(data)
    this.notifyListeners('**', this.deepClone(this.data), oldData)
    this.persist()
    return this
  }

  reset(): this {
    return this.replace({} as T)
  }

  push(path: string, item: JsonValue): this {
    const current = this.getByPath(this.data, this.parsePath(path))
    const arr: JsonArray = Array.isArray(current) ? [...current] : []
    arr.push(this.deepClone(item))
    return this.set(path, arr)
  }

  pull(path: string, predicate: (item: JsonValue, index: number) => boolean): this {
    const current = this.getByPath(this.data, this.parsePath(path))
    if (!Array.isArray(current)) return this
    return this.set(path, current.filter((item, i) => !predicate(item, i)))
  }

  updateWhere(
    path: string,
    predicate: (item: JsonValue, index: number) => boolean,
    updater: (item: JsonValue, index: number) => JsonValue,
  ): this {
    const current = this.getByPath(this.data, this.parsePath(path))
    if (!Array.isArray(current)) return this
    return this.set(path, current.map((item, i) => (predicate(item, i) ? updater(item, i) : item)))
  }

  // ── Serialization ───────────────────────────────────────────────────────────

  toJSON(indent?: number): string {
    return JSON.stringify(this.data, null, indent)
  }

  fromJSON(json: string): this {
    return this.replace(JSON.parse(json) as T)
  }

  toObject(): T {
    return this.deepClone(this.data)
  }

  clone(): JsonHandler<T> {
    return new JsonHandler<T>(this.deepClone(this.data))
  }

  // ── Flatten / Unflatten ─────────────────────────────────────────────────────

  flatten(separator = '.'): Record<string, JsonPrimitive | null> {
    const result: Record<string, JsonPrimitive | null> = {}

    const walk = (obj: unknown, prefix: string) => {
      if (obj === null || typeof obj !== 'object') {
        result[prefix] = obj as JsonPrimitive | null
        return
      }
      if (Array.isArray(obj)) {
        obj.forEach((item, i) => walk(item, `${prefix}${separator}${i}`))
        return
      }
      for (const key of Object.keys(obj as JsonObject)) {
        walk((obj as JsonObject)[key], prefix ? `${prefix}${separator}${key}` : key)
      }
    }

    walk(this.data, '')
    const cleaned: Record<string, JsonPrimitive | null> = {}
    for (const [k, v] of Object.entries(result)) {
      cleaned[k.startsWith(separator) ? k.slice(separator.length) : k] = v
    }
    return cleaned
  }

  static unflatten(flat: Record<string, unknown>, separator = '.'): JsonObject {
    const result: JsonObject = {}
    for (const [dotPath, value] of Object.entries(flat)) {
      const parts = dotPath.split(separator).filter(Boolean)
      let current: Record<string, unknown> = result
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]!
        if (current[part] == null || typeof current[part] !== 'object') current[part] = {}
        current = current[part] as Record<string, unknown>
      }
      current[parts[parts.length - 1]!] = value
    }
    return result
  }

  // ── Query ───────────────────────────────────────────────────────────────────

  pick(paths: string[]): JsonObject {
    const result: JsonObject = {}
    for (const p of paths) {
      const parts = this.parsePath(p)
      const value = this.getByPath(this.data, parts)
      if (value !== undefined) this.setByPath(result as Record<string, unknown>, parts, this.deepClone(value))
    }
    return result
  }

  omit(paths: string[]): T {
    const cloned = this.deepClone(this.data)
    for (const p of paths) this.deleteByPath(cloned as Record<string, unknown>, this.parsePath(p))
    return cloned
  }

  keys(path?: string): string[] {
    const target = path ? this.getByPath(this.data, this.parsePath(path)) : this.data
    if (target == null || typeof target !== 'object' || Array.isArray(target)) return []
    return Object.keys(target)
  }

  values(path?: string): JsonValue[] {
    const target = path ? this.getByPath(this.data, this.parsePath(path)) : this.data
    if (target == null || typeof target !== 'object' || Array.isArray(target)) return []
    return Object.values(target as JsonObject)
  }

  entries(path?: string): [string, JsonValue][] {
    const target = path ? this.getByPath(this.data, this.parsePath(path)) : this.data
    if (target == null || typeof target !== 'object' || Array.isArray(target)) return []
    return Object.entries(target as JsonObject)
  }

  find(predicate: (value: JsonValue, path: string) => boolean): QueryMatch | undefined {
    for (const [p, value] of Object.entries(this.flatten())) {
      if (predicate(value, p)) return { path: p, value }
    }
    return undefined
  }

  filter(predicate: (value: JsonValue, path: string) => boolean): QueryMatch[] {
    return Object.entries(this.flatten())
      .filter(([p, value]) => predicate(value, p))
      .map(([p, value]) => ({ path: p, value }))
  }

  compute<R>(selector: (state: T) => R): R {
    return selector(this.deepClone(this.data))
  }

  // ── Patch Operations ────────────────────────────────────────────────────────

  patch(ops: PatchOp[]): this {
    for (const op of ops) {
      if (op.op === 'set') this.set(op.path, op.value)
      else if (op.op === 'delete') this.delete(op.path)
      else if (op.op === 'merge') this.mergeAt(op.path, op.value)
    }
    return this
  }

  diff(other: JsonHandler<T> | T): PatchOp[] {
    const otherFlat = other instanceof JsonHandler ? other.flatten() : new JsonHandler(other).flatten()
    const thisFlat = this.flatten()
    const ops: PatchOp[] = []

    for (const [p, value] of Object.entries(otherFlat)) {
      if (thisFlat[p] !== value) ops.push({ op: 'set', path: p, value: value as JsonValue })
    }
    for (const p of Object.keys(thisFlat)) {
      if (!(p in otherFlat)) ops.push({ op: 'delete', path: p })
    }
    return ops
  }

  // ── Observer / Subscriptions ────────────────────────────────────────────────

  subscribe<V = JsonValue>(path: string, listener: PathListener<V>): Unsubscribe {
    if (!this.listeners.has(path)) this.listeners.set(path, new Set())
    this.listeners.get(path)!.add(listener as PathListener)
    return () => this.listeners.get(path)?.delete(listener as PathListener)
  }

  unsubscribeAll(path: string): this {
    this.listeners.delete(path)
    return this
  }

  clearListeners(): this {
    this.listeners.clear()
    return this
  }

  // ── Snapshot / History ──────────────────────────────────────────────────────

  snapshot(): string {
    return this.toJSON()
  }

  restore(snapshot: string): this {
    return this.fromJSON(snapshot)
  }

  // ── Utilities ───────────────────────────────────────────────────────────────

  size(path?: string): number {
    return this.keys(path).length
  }

  isEmpty(path?: string): boolean {
    if (path == null) return Object.keys(this.data).length === 0
    const value = this.get(path)
    if (value == null) return true
    if (typeof value === 'object') return Object.keys(value as object).length === 0
    if (typeof value === 'string') return value.length === 0
    return false
  }

  print(path?: string): this {
    console.log(JSON.stringify(path ? this.get(path) : this.data, null, 2))
    return this
  }
}
