/**
 * Nodes for constructing a reactive graph of reactive values and reactive computations.
 * The graph is acyclic.
 * The user inputs new values into the graph by calling set() on one more more reactive nodes.
 * The user retrieves computed results from the graph by calling get() on one or more reactive nodes.
 * The library is responsible for running any necessary reactive computations so that get() is
 * up to date with all prior set() calls anywhere in the graph.
 *
 * We call input nodes 'roots' and the output nodes 'leaves' of the graph here in discussion,
 * but the distinction is based on the use of the graph, all nodes have the same internal structure.
 * Changes flow from roots to leaves. It would be effective but inefficient to immediately propagate
 * all changes from a root through the graph to descendant leaves. Instead we defer change
 * most change progogation computation until a leaf is accessed. This allows us to coalesce computations
 * and skip altogether recalculating unused sections of the graph.
 *
 * Each reactive node tracks its sources and its observers (observers are other
 * elements that have this node as a source). Source and observer links are updated automatically
 * as observer reactive computations re-evaluate and call get() on their sources.
 *
 * Each node stores a cache state to support the change propogation algorithm: 'clean', 'check', or 'dirty'
 * In general, execution proceeds in three passes:
 *  1. set() propogates changes down the graph to the leaves
 *     direct children are marked as dirty and their deeper descendants marked as check
 *     (no reactive computations are evaluated)
 *  2. get() requests that parent nodes updateIfNecessary(), which proceeds recursively up the tree
 *     to decide whether the node is clean (parents unchanged) or dirty (parents changed)
 *  3. updateIfNecessary() evaluates the reactive computation if the node is dirty
 *     (the computations are executed in root to leaf order)
 */

/** current capture context for identifying @reactive sources (other reactive elements) and cleanups
 * - active while evaluating a reactive function body  */
let CurrentReaction: Reactive<any> | undefined = undefined
let CurrentGets: Reactive<any>[] | null = null
let CurrentGetsIndex = 0

/** A list of non-clean 'effect' nodes that will be updated when stabilize() is called */
let EffectQueue: Reactive<any>[] = []

let stabilizeFn: ((node: Reactive<any>) => void) | undefined = undefined // fn to call if there are dirty effect nodes
let stabilizationQueued = false // stabilizeFn() is queued to run after this event loop

/** reactive nodes are marked dirty when their source values change TBD*/
export const CacheClean = 0 // reactive value is valid, no need to recompute
export const CacheCheck = 1 // reactive value might be stale, check parent nodes to decide whether to recompute
export const CacheDirty = 2 // reactive value is invalid, parents have changed, valueneeds to be recomputed
export type CacheState = typeof CacheClean | typeof CacheCheck | typeof CacheDirty
type CacheNonClean = typeof CacheCheck | typeof CacheDirty

export function logDirty(_enable?: boolean): void {
  // TBD for a debug build
}

export interface ReactivelyParams {
  equals?: (a: any, b: any) => boolean
  effect?: boolean
}

/** A reactive element contains a mutable value that can be observed by other reactive elements.
 *
 * The property can be modified externally by calling set().
 *
 * Reactive elements may also contain a 0-ary function body that produces a new value using
 * values from other reactive elements.
 *
 * Dependencies on other elements are captured dynamically as the 'reactive' function body executes.
 *
 * The reactive function is re-evaluated when any of its dependencies change, and the result is
 * cached.
 */
export function reactive<T>(fnOrValue: T | (() => T), params?: ReactivelyParams): Reactive<T> {
  const node = new Reactive(fnOrValue, params?.effect)
  if (params?.equals) {
    node.equals = params.equals
  }
  return node
}

function defaultEquality(a: any, b: any) {
  return a === b
}

/** A reactive element contains a mutable value that can be observed by other reactive elements.
 *
 * The property can be modified externally by calling set().
 *
 * Reactive elements may also contain a 0-ary function body that produces a new value using
 * values from other reactive elements.
 *
 * Dependencies on other elements are captured dynamically as the 'reactive' function body executes.
 *
 * The reactive function is re-evaluated when any of its dependencies change, and the result is
 * cached.
 */
export class Reactive<T> {
  private _value: T
  private fn?: () => T
  private observers: Reactive<any>[] | null = null // nodes that have us as sources (down links)
  private sources: Reactive<any>[] | null = null // sources in reference order, not deduplicated (up links)

  private state: CacheState
  cleanups: ((oldValue: T) => void)[] = []
  equals = defaultEquality

  constructor(
    fnOrValue: (() => T) | T,
    readonly isEffect = false,
  ) {
    if (typeof fnOrValue === 'function') {
      this.fn = fnOrValue as () => T
      this._value = undefined as any
      this.isEffect = isEffect || false
      this.state = CacheDirty
      if (isEffect) {
        EffectQueue.push(this)
        stabilizeFn?.(this)
      }
    } else {
      this.fn = undefined
      this._value = fnOrValue
      this.state = CacheClean
      this.isEffect = false
    }
  }

  get value(): T {
    return this.get()
  }

  set value(v: T) {
    this.set(v)
  }

  get(): T {
    if (CurrentReaction) {
      if (!CurrentGets && CurrentReaction.sources && CurrentReaction.sources[CurrentGetsIndex] == this) {
        CurrentGetsIndex++
      } else {
        if (!CurrentGets) CurrentGets = [this]
        else CurrentGets.push(this)
      }
    }
    if (this.fn) this.updateIfNecessary()
    return this._value
  }

  set(fnOrValue: T | (() => T)): void {
    if (typeof fnOrValue === 'function') {
      const fn = fnOrValue as () => T
      if (fn !== this.fn) {
        this.stale(CacheDirty)
      }
      this.fn = fn
    } else {
      if (this.fn) {
        this.removeParentObservers(0)
        this.sources = null
        this.fn = undefined
      }
      const value = fnOrValue as T
      if (!this.equals(this._value, value)) {
        if (this.observers) {
          for (let i = 0; i < this.observers.length; i++) {
            const observer = this.observers[i]
            observer.stale(CacheDirty)
          }
        }
        this._value = value
      }
    }
  }

  private stale(state: CacheNonClean): void {
    if (this.state < state) {
      // If we were previously clean, then we know that we may need to update to get the new value
      if (this.state === CacheClean && this.isEffect) {
        EffectQueue.push(this)
        stabilizeFn?.(this)
      }

      this.state = state
      if (this.observers) {
        for (let i = 0; i < this.observers.length; i++) {
          this.observers[i].stale(CacheCheck)
        }
      }
    }
  }

  /** run the computation fn, updating the cached value */
  private update(): void {
    const oldValue = this._value

    /* Evalute the reactive function body, dynamically capturing any other reactives used */
    const prevReaction = CurrentReaction
    const prevGets = CurrentGets
    const prevIndex = CurrentGetsIndex

    CurrentReaction = this
    CurrentGets = null as any // prevent TS from thinking CurrentGets is null below
    CurrentGetsIndex = 0

    try {
      if (this.cleanups.length) {
        this.cleanups.forEach((c) => c(this._value))
        this.cleanups = []
      }
      this._value = this.fn!()

      // if the sources have changed, update source & observer links
      if (CurrentGets) {
        // remove all old sources' .observers links to us
        this.removeParentObservers(CurrentGetsIndex)
        // update source up links
        if (this.sources && CurrentGetsIndex > 0) {
          this.sources.length = CurrentGetsIndex + CurrentGets.length
          for (let i = 0; i < CurrentGets.length; i++) {
            this.sources[CurrentGetsIndex + i] = CurrentGets[i]
          }
        } else {
          this.sources = CurrentGets
        }

        for (let i = CurrentGetsIndex; i < this.sources.length; i++) {
          // Add ourselves to the end of the parent .observers array
          const source = this.sources[i]
          if (!source.observers) {
            source.observers = [this]
          } else {
            source.observers.push(this)
          }
        }
      } else if (this.sources && CurrentGetsIndex < this.sources.length) {
        // remove all old sources' .observers links to us
        this.removeParentObservers(CurrentGetsIndex)
        this.sources.length = CurrentGetsIndex
      }
    } finally {
      CurrentGets = prevGets
      CurrentReaction = prevReaction
      CurrentGetsIndex = prevIndex
    }

    // handles diamond depenendencies if we're the parent of a diamond.
    if (!this.equals(oldValue, this._value) && this.observers) {
      // We've changed value, so mark our children as dirty so they'll reevaluate
      for (let i = 0; i < this.observers.length; i++) {
        const observer = this.observers[i]
        observer.state = CacheDirty
      }
    }

    // We've rerun with the latest values from all of our sources.
    // This means that we no longer need to update until a signal changes
    this.state = CacheClean
  }

  /** update() if dirty, or a parent turns out to be dirty. */
  private updateIfNecessary(): void {
    // If we are potentially dirty, see if we have a parent who has actually changed value
    if (this.state === CacheCheck) {
      for (const source of this.sources!) {
        source.updateIfNecessary() // updateIfNecessary() can change this.state
        if ((this.state as CacheState) === CacheDirty) {
          // Stop the loop here so we won't trigger updates on other parents unnecessarily
          // If our computation changes to no longer use some sources, we don't
          // want to update() a source we used last time, but now don't use.
          break
        }
      }
    }

    // If we were already dirty or marked dirty by the step above, update.
    if (this.state === CacheDirty) {
      this.update()
    }

    // By now, we're clean
    this.state = CacheClean
  }

  private removeParentObservers(index: number): void {
    if (!this.sources) return
    for (let i = index; i < this.sources.length; i++) {
      const source: Reactive<any> = this.sources[i] // We don't actually delete sources here because we're replacing the entire array soon
      const swap = source.observers!.findIndex((v) => v === this)
      source.observers![swap] = source.observers![source.observers!.length - 1]
      source.observers!.pop()
    }
  }
}

export function onCleanup<T = any>(fn: (oldValue: T) => void): void {
  if (CurrentReaction) {
    CurrentReaction.cleanups.push(fn)
  } else {
    console.error('onCleanup must be called from within a @reactive function')
  }
}

/** run all non-clean effect nodes */
export function stabilize(): void {
  for (let i = 0; i < EffectQueue.length; i++) {
    EffectQueue[i].get()
  }
  EffectQueue.length = 0
}

/** run a function for each dirty effect node.  */
export function autoStabilize(fn = deferredStabilize): void {
  stabilizeFn = fn
}

/** queue stabilize() to run at the next idle time */
function deferredStabilize(): void {
  if (!stabilizationQueued) {
    stabilizationQueued = true

    queueMicrotask(() => {
      stabilizationQueued = false
      stabilize()
    })
  }
}
