import { TimeoutError } from './CustomError';

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
  static delay(timeout: number): Promise<void> { return new Promise((r) => setTimeout(r, timeout)) }
  #timeout(handler: () => void, timeout: number) {
    this.#type = TimerType.Timeout;
    this.#id = self.setTimeout(handler, timeout);
  }
  #interval(handler: () => void, timeout: number) {
    this.#type = TimerType.Interval;
    this.#id = self.setInterval(handler, timeout);
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
    /**包装后返回一个新Promise，如原Promise未在限时内完成，则reject */
    timeout(ms: number, label?: string): Promise<T>;
    /**包装后返回一个可在原Promise结束前`resolve`或`reject`的Promise */
    controlled(): ControlledPromise<T>;
  }
}
/**可在原`Promise`结束前`resolve`或`reject`的包装。 */
interface ControlledPromise<T> extends Promise<T> {
  resolve(reason: T): void;
  reject(reason?: any): void;
}
export const resolvedInTimeSymbol = Symbol('Promise resolved in time');
defineProps(Promise.prototype, {
  timeout(ms: number, label?: string): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const requestedPromise = this;
    if (ms <= 0)
      return requestedPromise;
    let resolved = false;
    requestedPromise.then(() => resolved = true);
    return Promise.race([requestedPromise, new Promise((rs, rj) => setTimeout(() => {
      if (resolved) rs(resolvedInTimeSymbol);
      else rj(new TimeoutError(requestedPromise, label));
    }, ms))]);
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

export function limit(input: number, min?: number, max?: number) {
  if (typeof min === 'number')
    if (input < min)
      input = min;
  if (typeof max === 'number')
    if (input > max)
      input = max;
  return input;
}

/**包装指定函数，返回异步函数 */
export function makeAsync<I extends any[], O>(from: ((...args: I) => O) | ((...args: I) => Promise<O>), preTask?: () => void, postTask?: () => void)
  : (...args: I) => Promise<O> {
  return async (...args) => {
    preTask?.();
    const result = await from(...args);
    postTask?.();
    return result;
  };
}

/**连接多个以空格分割的token串 */
export function combineTokens(...tokens: (string | undefined)[]): string {
  const resTokens = new Set<string>();
  tokens.forEach(ts => {
    ts = ts?.trim();
    if (!ts) return;
    ts.split(' ').forEach(t => {
      t = t.trim();
      if (t)
        resTokens.add(t);
    });
  });
  let result = '';
  for (const t of resTokens) {
    if (result)
      result += ' ';
    result += t;
  }
  return result;
}

export function throwErr(err: string | Error, ...addtionalData: any[]): never {
  console.error(...addtionalData);
  if (!(err instanceof Error))
    err = new Error(err);
  throw err;
}