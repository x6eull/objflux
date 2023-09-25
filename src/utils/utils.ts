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

function defineProps<T extends object>(target: T, props: { [key: PropertyKey]: any } & ThisType<T>): T {
  const desc: PropertyDescriptorMap = {};
  for (const key of Reflect.ownKeys(props))
    desc[key] = {
      value: props[key],
      configurable: true,
      writable: true,
      enumerable: false
    };
  return Object.defineProperties(target, desc);
}

declare global {
  interface Promise<T> {
    timeout(ms: number, label?: string): Promise<T>;
    controlled(): ControlledPromise<T>;
  }
}
/**可在原`Promise`结束前`resolve`或`reject`的包装。 */
interface ControlledPromise<T> extends Promise<T> {
  resolve(reason: T): void;
  reject(reason?: any): void;
}
defineProps(Promise.prototype, {
  timeout(ms: number, label?: string): Promise<unknown> {
    return Promise.race([this, new Promise((_, rj) => setTimeout((err: Error) => rj(err), ms, new Error(`Promise Timeout${label ? ` (${label})` : ''}`)))]);
  },
  controlled(): ControlledPromise<unknown> {
    let conRs, conRj;
    const conPromise = new Promise((rs, rj) => {
      conRs = rs;
      conRj = rj;
    });
    const race = Promise.race([this, conPromise]);
    defineProps(race, {
      resolve: conRs,
      reject: conRj
    });
    return race as ControlledPromise<unknown>;
  }
});

export function combine(...funcs: (((...args: any[]) => any) | undefined)[]): (...args: any[]) => any {
  const fs: ((...args: any[]) => any)[] = funcs.filter(f => f instanceof Function) as any;
  return (...args) => {
    let rv;
    for (const f of fs)
      rv = f(...args);
    return rv;
  };
}

export function scopedVar<T>(init: T): { get(): T, set(v: T): void } {
  return (() => {
    let __var = init;
    return {
      get() { return __var },
      set(v: T) { __var = v }
    };
  })();
}

export function limit(input: number, min?: number, max?: number) {
  if (typeof min === 'number')
    if (input < min)
      input = min;
  if (typeof max === 'number')
    if (input > max)
      input = max;
  return input;
}