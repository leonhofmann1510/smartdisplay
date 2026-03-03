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

// ─── JsonHandler ─────────────────────────────────────────────────────────────

export class JsonHandler<T extends JsonObject = JsonObject> {
  private data: T
  private listeners: Map<string, Set<PathListener>>

  constructor(initialData: T = {} as T) {
    this.data = this.deepClone(initialData)
    this.listeners = new Map()
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
    // Notify exact path listeners
    const exact = this.listeners.get(path)
    if (exact) {
      exact.forEach(cb => cb(newValue, oldValue, path))
    }

    // Notify wildcard listeners on parent paths
    const parts = this.parsePath(path)
    for (let i = parts.length - 1; i >= 0; i--) {
      const parent = parts.slice(0, i).join('.')
      const wildcardKey = parent ? `${parent}.*` : '*'
      const wildcardListeners = this.listeners.get(wildcardKey)
      if (wildcardListeners) {
        wildcardListeners.forEach(cb => cb(newValue, oldValue, path))
      }
    }

    // Root wildcard
    const rootWild = this.listeners.get('**')
    if (rootWild) {
      rootWild.forEach(cb => cb(newValue, oldValue, path))
    }
  }

  // ── Core CRUD ───────────────────────────────────────────────────────────────

  /** Get the entire state object */
  get(): T
  /** Get value at dot-notation path */
  get<V = JsonValue>(path: string): V | undefined
  get<V = JsonValue>(path?: string): T | V | undefined {
    if (path == null) return this.deepClone(this.data)
    const parts = this.parsePath(path)
    if (parts.length === 0) return this.deepClone(this.data) as unknown as V
    return this.deepClone(this.getByPath(this.data, parts)) as V
  }

  /** Set value at dot-notation path, creates nested objects as needed */
  set(path: string, value: JsonValue): this {
    const parts = this.parsePath(path)
    const oldValue = this.getByPath(this.data, parts)
    this.setByPath(this.data as Record<string, unknown>, parts, this.deepClone(value))
    this.notifyListeners(path, this.deepClone(value), oldValue)
    return this
  }

  /** Delete a key at dot-notation path */
  delete(path: string): boolean {
    const parts = this.parsePath(path)
    const oldValue = this.getByPath(this.data, parts)
    const deleted = this.deleteByPath(this.data as Record<string, unknown>, parts)
    if (deleted) this.notifyListeners(path, undefined, oldValue)
    return deleted
  }

  /** Check if a path exists (and is not undefined) */
  has(path: string): boolean {
    const parts = this.parsePath(path)
    return this.getByPath(this.data, parts) !== undefined
  }

  // ── Bulk Operations ─────────────────────────────────────────────────────────

  /** Deep-merge a partial object into the root state */
  merge(partial: Partial<T>): this {
    const oldData = this.deepClone(this.data)
    this.data = this.deepMergeObjects(this.data, partial as JsonObject) as T
    this.notifyListeners('**', this.deepClone(this.data), oldData)
    return this
  }

  /** Deep-merge an object into a specific path */
  mergeAt(path: string, value: JsonObject): this {
    const parts = this.parsePath(path)
    const existing = this.getByPath(this.data, parts)
    const merged = this.deepMergeObjects(
      (existing && typeof existing === 'object' && !Array.isArray(existing) ? existing : {}) as JsonObject,
      value
    )
    return this.set(path, merged)
  }

  /** Completely replace the state */
  replace(data: T): this {
    const oldData = this.deepClone(this.data)
    this.data = this.deepClone(data)
    this.notifyListeners('**', this.deepClone(this.data), oldData)
    return this
  }

  /** Reset the state to an empty object */
  reset(): this {
    return this.replace({} as T)
  }

  /** Push an item to an array at path */
  push(path: string, item: JsonValue): this {
    const parts = this.parsePath(path)
    const current = this.getByPath(this.data, parts)
    const arr: JsonArray = Array.isArray(current) ? [...current] : []
    arr.push(this.deepClone(item))
    return this.set(path, arr)
  }

  /** Remove items from an array at path by predicate */
  pull(path: string, predicate: (item: JsonValue, index: number) => boolean): this {
    const parts = this.parsePath(path)
    const current = this.getByPath(this.data, parts)
    if (!Array.isArray(current)) return this
    return this.set(path, current.filter((item, i) => !predicate(item, i)))
  }

  /** Update items in an array at path by predicate */
  updateWhere(
    path: string,
    predicate: (item: JsonValue, index: number) => boolean,
    updater: (item: JsonValue, index: number) => JsonValue
  ): this {
    const parts = this.parsePath(path)
    const current = this.getByPath(this.data, parts)
    if (!Array.isArray(current)) return this
    return this.set(path, current.map((item, i) => (predicate(item, i) ? updater(item, i) : item)))
  }

  // ── Serialization ───────────────────────────────────────────────────────────

  /** Serialize state to a JSON string */
  toJSON(indent?: number): string {
    return JSON.stringify(this.data, null, indent)
  }

  /** Deserialize a JSON string into the state (replaces current state) */
  fromJSON(json: string): this {
    const parsed = JSON.parse(json) as T
    return this.replace(parsed)
  }

  /** Return a plain object copy of the state */
  toObject(): T {
    return this.deepClone(this.data)
  }

  /** Return a new JsonHandler with a deep-cloned copy of this state */
  clone(): JsonHandler<T> {
    return new JsonHandler<T>(this.deepClone(this.data))
  }

  // ── Flatten / Unflatten ─────────────────────────────────────────────────────

  /** Flatten nested state to dot-notation key/value pairs */
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
    // Remove the leading separator from root-level prefix artifact
    const cleaned: Record<string, JsonPrimitive | null> = {}
    for (const [k, v] of Object.entries(result)) {
      cleaned[k.startsWith(separator) ? k.slice(separator.length) : k] = v
    }
    return cleaned
  }

  /** Build a nested object from dot-notation key/value pairs */
  static unflatten(flat: Record<string, unknown>, separator = '.'): JsonObject {
    const result: JsonObject = {}
    for (const [dotPath, value] of Object.entries(flat)) {
      const parts = dotPath.split(separator).filter(Boolean)
      let current: Record<string, unknown> = result
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]!
        if (current[part] == null || typeof current[part] !== 'object') {
          current[part] = {}
        }
        current = current[part] as Record<string, unknown>
      }
      current[parts[parts.length - 1]!] = value
    }
    return result
  }

  // ── Query ───────────────────────────────────────────────────────────────────

  /** Pick specific top-level keys (or dot-notation paths) */
  pick(paths: string[]): JsonObject {
    const result: JsonObject = {}
    for (const path of paths) {
      const parts = this.parsePath(path)
      const value = this.getByPath(this.data, parts)
      if (value !== undefined) {
        this.setByPath(result as Record<string, unknown>, parts, this.deepClone(value))
      }
    }
    return result
  }

  /** Omit specific top-level keys (or dot-notation paths) */
  omit(paths: string[]): T {
    const cloned = this.deepClone(this.data)
    for (const path of paths) {
      const parts = this.parsePath(path)
      this.deleteByPath(cloned as Record<string, unknown>, parts)
    }
    return cloned
  }

  /** Get all keys at a path (or root) */
  keys(path?: string): string[] {
    const target = path ? this.getByPath(this.data, this.parsePath(path)) : this.data
    if (target == null || typeof target !== 'object' || Array.isArray(target)) return []
    return Object.keys(target)
  }

  /** Get all values at a path (or root) */
  values(path?: string): JsonValue[] {
    const target = path ? this.getByPath(this.data, this.parsePath(path)) : this.data
    if (target == null || typeof target !== 'object' || Array.isArray(target)) return []
    return Object.values(target as JsonObject)
  }

  /** Get all entries at a path (or root) */
  entries(path?: string): [string, JsonValue][] {
    const target = path ? this.getByPath(this.data, this.parsePath(path)) : this.data
    if (target == null || typeof target !== 'object' || Array.isArray(target)) return []
    return Object.entries(target as JsonObject)
  }

  /** Find first value matching predicate via deep traversal */
  find(predicate: (value: JsonValue, path: string) => boolean): QueryMatch | undefined {
    const flat = this.flatten()
    for (const [path, value] of Object.entries(flat)) {
      if (predicate(value, path)) return { path, value }
    }
    return undefined
  }

  /** Find all values matching predicate via deep traversal */
  filter(predicate: (value: JsonValue, path: string) => boolean): QueryMatch[] {
    const flat = this.flatten()
    return Object.entries(flat)
      .filter(([path, value]) => predicate(value, path))
      .map(([path, value]) => ({ path, value }))
  }

  /** Compute a value derived from state */
  compute<R>(selector: (state: T) => R): R {
    return selector(this.deepClone(this.data))
  }

  // ── Patch Operations ────────────────────────────────────────────────────────

  /** Apply an array of patch operations atomically */
  patch(ops: PatchOp[]): this {
    for (const op of ops) {
      switch (op.op) {
        case 'set':
          this.set(op.path, op.value)
          break
        case 'delete':
          this.delete(op.path)
          break
        case 'merge':
          this.mergeAt(op.path, op.value)
          break
      }
    }
    return this
  }

  /** Compute the diff between this state and another as patch ops */
  diff(other: JsonHandler<T> | T): PatchOp[] {
    const otherFlat = other instanceof JsonHandler
      ? other.flatten()
      : new JsonHandler(other).flatten()
    const thisFlat = this.flatten()
    const ops: PatchOp[] = []

    for (const [path, value] of Object.entries(otherFlat)) {
      if (thisFlat[path] !== value) {
        ops.push({ op: 'set', path, value: value as JsonValue })
      }
    }
    for (const path of Object.keys(thisFlat)) {
      if (!(path in otherFlat)) {
        ops.push({ op: 'delete', path })
      }
    }
    return ops
  }

  // ── Observer / Subscriptions ────────────────────────────────────────────────

  /**
   * Subscribe to changes at a path.
   * - Exact path: `"user.name"`
   * - Wildcard child: `"user.*"` (fires for any direct child change)
   * - Any change: `"**"`
   */
  subscribe<V = JsonValue>(path: string, listener: PathListener<V>): Unsubscribe {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set())
    }
    this.listeners.get(path)!.add(listener as PathListener)
    return () => {
      this.listeners.get(path)?.delete(listener as PathListener)
    }
  }

  /** Remove all listeners for a specific path */
  unsubscribeAll(path: string): this {
    this.listeners.delete(path)
    return this
  }

  /** Remove every listener */
  clearListeners(): this {
    this.listeners.clear()
    return this
  }

  // ── Snapshot / History ──────────────────────────────────────────────────────

  /** Capture the current state as a serialized snapshot string */
  snapshot(): string {
    return this.toJSON()
  }

  /** Restore the state from a snapshot string */
  restore(snapshot: string): this {
    return this.fromJSON(snapshot)
  }

  // ── Utilities ───────────────────────────────────────────────────────────────

  /** Return the number of top-level keys (or keys at path) */
  size(path?: string): number {
    return this.keys(path).length
  }

  /** Check if state (or value at path) is empty */
  isEmpty(path?: string): boolean {
    if (path == null) return Object.keys(this.data).length === 0
    const value = this.get(path)
    if (value == null) return true
    if (typeof value === 'object') return Object.keys(value as object).length === 0
    if (typeof value === 'string') return value.length === 0
    return false
  }

  /** Pretty-print state to console */
  print(path?: string): this {
    const target = path ? this.get(path) : this.data
    console.log(JSON.stringify(target, null, 2))
    return this
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/** Create a new JsonHandler instance */
export const createJsonHandler = <T extends JsonObject = JsonObject>(initialData?: T): JsonHandler<T> =>
  new JsonHandler<T>(initialData)
