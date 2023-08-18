let incrementalId = 0;
export function newId() {
  return incrementalId++;
}

export type RecordAny<K extends string | number | symbol = string | number | symbol> = Record<K, any>;
export type StringRecord<V = any> = Record<string, V>;
export type RecordNever<K extends string | number | symbol = string> = Record<K, never>;

/**返回在指定毫秒后完成的`Promise`。 */
export function after(timeout: number) {
  return new Promise((rs) => setTimeout(rs, timeout));
}

enum TimerType {
  Timeout, Interval
}
/**计时器，可切换多种模式，且切换时会自动清除已有的计时任务。 */
export class Timer {
  #type?: TimerType;
  #id?: number;
  #timeout(handler: () => void, timeout: number) {
    this.#type = TimerType.Timeout;
    this.#id = setTimeout(handler, timeout);
  }
  #interval(handler: () => void, timeout: number) {
    this.#type = TimerType.Interval;
    this.#id = setInterval(handler, timeout);
  }
  clearCurrent() {
    if (typeof this.#id === 'number') {
      if (this.#type === TimerType.Timeout)
        clearTimeout(this.#id);
      else clearInterval(this.#id);
    }
    this.#type = undefined;
    this.#id = undefined;
  }
  timeout(handler: () => any, timeout: number, invokeNow = false) {
    this.clearCurrent();
    if (invokeNow)
      handler();
    this.#timeout(handler, timeout);
  }
  interval(handler: () => any, timeout: number, invokeNow = false) {
    this.clearCurrent();
    if (invokeNow)
      handler();
    this.#interval(handler, timeout);
  }
}

type To<T, F> = T | ((from: F) => T);
/**注意，如果不提供`defaultSwitch`且未匹配，则返回`undefined`。 */
export function switchString<R>(value: string, handler: { [on: string]: To<R, string> }, defaultReturn?: R): R {
  for (const [on, ret] of Object.entries(handler)) {
    if (Object.is(value, on))
      return ret instanceof Function ? ret(value) : ret;
  }
  return defaultReturn as R;
}

declare global {
  interface Promise<T> {
    timeout(ms: number, label?: string): Promise<T>;
    revocable(): { promise: Promise<T>, revoke(result?: T): void };
  }
}
Object.defineProperties(Promise.prototype, {
  timeout: {
    writable: true,
    enumerable: false,
    configurable: true,
    value(ms: number, label?: string): Promise<unknown> {
      return Promise.race([this, new Promise((_, rj) => setTimeout((err: Error) => rj(err), ms, new Error(`Promise Timeout${label ? ` (${label})` : ''}`)))]);
    }
  },
  revocable: {
    writable: true,
    enumerable: false,
    configurable: true,
    value(): { promise: Promise<unknown>, revoke(result?: unknown): void } {
      let rProRs: (result?: unknown) => void = undefined as any;
      const revokePromise = new Promise(rs => rProRs = rs);
      return {
        promise: Promise.race([this, revokePromise]),
        revoke: rProRs
      };
    }
  }
});