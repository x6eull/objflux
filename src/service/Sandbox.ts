import { StringRecord } from '../utils/utils';
import sandboxWorkerScript from './sandboxWorkerScript.js?raw';

function toDataURL(js: string) {
  return `data:text/javascript,${encodeURIComponent(js)}`;
}

enum State {
  Initing,
  Ready,
  Disposed
}
export class Sandbox {
  #msgId = 0;
  readonly #worker: Worker;
  readonly #key: number;
  #initWaitlist: (() => void)[] = [];
  readonly #evalWaitlist: Map<number, [(evalResult: { result: any, storeIndex?: number }) => void, (reason: any) => void]> = new Map();
  state: State = State.Initing;

  private __onmessage = (...args: [MessageEvent]) => this.#acceptMessage(...args);
  constructor() {
    this.#key = 10000000 + Math.floor(Math.random() * 89999999);
    this.#worker = new Worker(toDataURL(`let __key=${this.#key};${sandboxWorkerScript}`));
    this.#worker.addEventListener('message', this.__onmessage);
  }

  init(): Promise<void> {
    if (this.state === State.Ready) return Promise.resolve();
    return new Promise(rs => this.#initWaitlist.push(rs));
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
      });
    });
  }

  #send(data: StringRecord): number {
    const messageData = { ...data, msgId: this.#msgId };
    this.#worker.postMessage(messageData);
    return this.#msgId++;
  }

  #acceptMessage(ev: MessageEvent) {
    if (ev.data?.key !== this.#key)
      return;
    switch (ev.data?.type) {
      case 'init.ok':
        this.state = State.Ready;
        this.#initWaitlist.forEach(cb => cb());
        this.#initWaitlist = [];
        break;
      case 'eval.result': {
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
    this.state = State.Disposed;
    this.#worker.removeEventListener('message', this.__onmessage);
    this.#worker.terminate();
  }
}