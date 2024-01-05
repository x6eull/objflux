import { OfTypeError } from '../utils/CustomError';
import { StringRecord } from '../utils/utils';
import workerScript from './sandboxWorkerScript.js?raw';

let sandboxId = 0;
enum State {
  Initing,
  Ready,
  Disposed
}
type IndexBaseType = number;
type IndexedKinds<V> = { [i: IndexBaseType]: V };
type AsyncCallback<R, J> = [(result: R) => void, (reason: J) => void];
type CallbackArgKinds = [EvalCallBackArg, void];
class WaitList<K, I extends IndexBaseType, C extends IndexedKinds<any>> {
  #map = new Map<K, [I, ...(AsyncCallback<C[I], any>)[]]>();
  clear(): void { return this.#map.clear() }
  rejectEach(reason: any): void {
    for (const [_type, ...callbacks] of this.#map.values())
      callbacks.forEach(c => c[1](reason));
  }
  add<T extends I>(key: K, type: T, value: AsyncCallback<C[T], any>) {
    const curArray = this.#map.get(key);
    if (!curArray)
      this.#map.set(key, [type, value]);
    else
      if (type !== curArray[0])
        throw new OfTypeError('Invalid callback type (add)');
      else {
        curArray.push(value);
      }
  }
  /**获取指定`key`的回调列表，并删除该`key` */
  take<T extends I>(key: K, type: T): AsyncCallback<C[T], any>[] {
    const curArray = this.#map.get(key);
    if (!curArray)
      return [];
    else {
      const curType = curArray.shift() as I;
      if (curType !== type)
        throw new OfTypeError('Invalid callback type (take)');
      else {
        this.#map.delete(key);
        return curArray as AsyncCallback<C[I], any>[];
      }
    }
  }
}
type EvalCallBackArg<I extends number | undefined = number | undefined> = { result: any, storeIndex: I };
export class Sandbox {
  readonly id = sandboxId++;
  #msgId = 0;
  #worker: Worker;
  readonly #key: number;
  #initWaitlist: [(() => void), (err: Error) => void][] = [];
  #callbackWaitlist: WaitList<number, 0 | 1, CallbackArgKinds> = new WaitList();
  state: State = State.Initing;

  private __onmessage = (...args: [MessageEvent]) => this.#acceptMessage(...args);
  constructor() {
    this.#key = 10000000 + Math.floor(Math.random() * 89999999);//[10000000,9999999)
    this.#worker = new Worker(`data:text/javascript,${self.encodeURIComponent(workerScript)}`, {
      name: `sandbox_${this.id}`,
      type: 'module',
      credentials: 'omit'
    });
    this.#worker.addEventListener('message', this.__onmessage);
  }

  init(): Promise<void> {
    if (this.state === State.Ready)
      return Promise.resolve();
    if (this.state === State.Disposed)
      return Promise.reject(new Error('沙箱实例已销毁'));
    return new Promise((rs, rj) => this.#initWaitlist.push([rs, rj]));
  }

  /**在沙箱的全局作用域定义一个函数并调用。新函数使用`args`数组接收参数。 */
  eval<S extends boolean | undefined>(evalData: { body: string, args?: any[], withStore?: number[] | false, doStore?: S | boolean, doAwait?: boolean, doReturn?: boolean, doReturnError?: boolean }): Promise<EvalCallBackArg<S extends true ? number : undefined>> {
    evalData.args ??= [];
    evalData.withStore ??= false;
    evalData.doStore ??= false;
    evalData.doAwait ??= false;
    evalData.doReturn ??= true;
    evalData.doReturnError ??= true;
    return new Promise<EvalCallBackArg<S extends true ? number : undefined>>((rs, rj) => {
      this.init().then(() => {
        const i = this.#send({ evalData: { ...evalData, doMessage: true }, type: 'eval.request' });
        this.#callbackWaitlist.add(i, 0, [rs as any, rj]);
      }).catch(rj);
    });
  }

  deleteStore(index: number): Promise<void> {
    return new Promise((rs, rj) => {
      const i = this.#send({ type: 'store.delete', index });
      this.#callbackWaitlist.add(i, 1, [rs, rj]);
    });
  }

  #send(data: StringRecord): number {
    const messageData = { ...data, msgId: this.#msgId };
    this.#worker.postMessage(messageData);
    return this.#msgId++;
  }

  #acceptMessage(ev: MessageEvent) {
    switch (ev.data?.type) {
      case 'init.listening':
        if (this.state !== State.Initing)
          break;
        this.#send({ type: 'init.key', key: this.#key });
        break;
      case 'init.ready':
        if (ev.data?.key !== this.#key)
          break;
        this.state = State.Ready;
        this.#initWaitlist.forEach(([cb]) => cb());
        this.#initWaitlist = undefined as any;
        break;
      case 'eval.result': {
        if (ev.data?.key !== this.#key)
          break;
        const v = this.#callbackWaitlist.take(ev.data.msgId, 0);
        v.forEach(([rs, rj]) => {
          if (ev.data.error)
            rj(ev.data.error);
          else
            rs({ result: ev.data.evalResult, storeIndex: ev.data.storeIndex });
        })
        break;
      }
      case 'store.done':
        this.#callbackWaitlist.take(ev.data.msgId, 1).forEach(([rs]) => rs());
    }
  }

  /**销毁此沙箱。销毁的实例不能再次初始化。 */
  dispose() {
    self.removeEventListener('message', this.__onmessage);
    this.state = State.Disposed;
    this.#worker?.terminate();
    this.#worker = undefined as any;
    this.#initWaitlist?.forEach(([, rj]) => rj(new Error('沙箱实例已销毁')));
    this.#initWaitlist = undefined as any;
    this.#callbackWaitlist?.rejectEach(new Error('沙箱实例已销毁'));
    this.#callbackWaitlist?.clear();
    this.#callbackWaitlist = undefined as any;
  }
}