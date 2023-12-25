import { StringRecord } from '../utils/utils';
import workerScript from './sandboxWorkerScript.js?raw';

let sandboxId = 0;
enum State {
  Initing,
  Ready,
  Disposed
}
export class Sandbox {
  readonly id = sandboxId++;
  #msgId = 0;
  #worker: Worker;
  readonly #key: number;
  #initWaitlist: [(() => void), (err: Error) => void][] = [];
  #evalWaitlist: Map<number, [(evalResult: { result: any, storeIndex?: number }) => void, (reason: any) => void]> = new Map();
  state: State = State.Initing;

  private __onmessage = (...args: [MessageEvent]) => this.#acceptMessage(...args);
  constructor() {
    this.#key = 10000000 + Math.floor(Math.random() * 89999999);
    this.#worker = new Worker(`data:text/javascript;base64,${self.encodeURIComponent(self.btoa(workerScript))}`, {
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

  /**在沙箱的全局作用域定义一个函数并调用。新函数使用`args`接收参数。 */
  eval(evalData: { body: string, args?: any[], withStore?: number | false, doStore?: boolean, doAwait?: boolean, doReturn?: boolean, doReturnError?: boolean }): Promise<{ result: any, storeIndex?: number }> {
    evalData.args ??= [];
    evalData.withStore ??= false;
    evalData.doStore ??= false;
    evalData.doAwait ??= false;
    evalData.doReturn ??= true;
    evalData.doReturnError ??= true;
    return new Promise((rs, rj) => {
      this.init().then(() => {
        const i = this.#send({ evalData: { ...evalData, doMessage: true }, type: 'eval.request' });
        this.#evalWaitlist.set(i, [rs, rj]);
      }).catch(rj);
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
        const v = this.#evalWaitlist.get(ev.data.msgId);
        if (v) {
          this.#evalWaitlist.delete(ev.data.msgId);
          if (ev.data.error)
            v[1](ev.data.error);
          else
            v[0]({ result: ev.data.evalResult, storeIndex: ev.data.storeIndex });
        }
        break;
      }
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
    this.#evalWaitlist?.forEach(([, rj]) => rj(new Error('沙箱实例已销毁')));
    this.#evalWaitlist = undefined as any;
  }
}