// From https://github.com/EthanStandel/deepsignal/blob/main/packages/core/src/core.ts
import { Signal, batch, signal } from './preact-core'

export type AtomicState =
  | Array<unknown>
  | ((...args: unknown[]) => unknown)
  | string
  | boolean
  | number
  | bigint
  | symbol
  | undefined
  | null

export type DeepState = {
  [key: string]: (() => unknown) | AtomicState | DeepState
}

export type ReadOnlyDeep<T> = {
  readonly [P in keyof T]: ReadOnlyDeep<T[P]>
}

export interface DeepSignalAccessors<T extends DeepState> {
  value: ReadOnlyDeep<T>
  peek: () => ReadOnlyDeep<T>
}

export type DeepSignalType<T extends DeepState> = DeepSignalAccessors<T> & {
  [K in keyof T]: T[K] extends AtomicState ? Signal<T[K]> : T[K] extends DeepState ? DeepSignalType<T[K]> : Signal<T[K]>
}

export class DeepSignal<T extends DeepState> implements DeepSignalAccessors<T> {
  get value(): ReadOnlyDeep<T> {
    return getValue(this as DeepSignalType<T>)
  }

  set value(payload: ReadOnlyDeep<T>) {
    batch(() => setValue(this as DeepSignalType<T>, payload))
  }

  peek(): ReadOnlyDeep<T> {
    return getValue(this as DeepSignalType<T>, { peek: true })
  }
}

export const deepSignal = <T extends DeepState>(initialValue: T): DeepSignalType<T> =>
  Object.assign(
    new DeepSignal(),
    Object.entries(initialValue).reduce(
      (acc, [key, value]) => {
        if (['value', 'peek'].some((iKey) => iKey === key)) {
          throw new Error(`${key} is a reserved property name`)
        } else if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          acc[key] = signal(value)
        } else {
          acc[key] = deepSignal(value)
        }
        return acc
      },
      {} as { [key: string]: unknown },
    ),
  ) as DeepSignalType<T>

const setValue = <U extends DeepState, T extends DeepSignalType<U>>(deepSignal: T, payload: U): void =>
  Object.keys(payload).forEach((key: keyof U) => (deepSignal[key].value = payload[key]))

const getValue = <U extends DeepState, T extends DeepSignalType<U>>(
  deepSignal: T,
  { peek = false }: { peek?: boolean } = {},
): ReadOnlyDeep<U> =>
  Object.entries(deepSignal).reduce(
    (acc, [key, value]) => {
      if (value instanceof Signal) {
        acc[key] = peek ? value.peek() : value.value
      } else if (value instanceof DeepSignal) {
        acc[key] = getValue(value as DeepSignalType<DeepState>, { peek })
      }
      return acc
    },
    {} as { [key: string]: unknown },
  ) as ReadOnlyDeep<U>
