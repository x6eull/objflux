import { StringRecord } from '../utils/utils';
import sandboxHtml from './sandbox.html?raw';

let sbId = 0;
enum State {
  Initing,
  Ready,
  Disposed
}
export class Sandbox {
  #msgId = 0;
  readonly #iframe: HTMLIFrameElement;
  readonly #source: Window;
  readonly #mk: string;
  readonly #initWaitlist: (() => void)[] = [];
  readonly #evalWaitlist: Map<number, [(evalResult: { result: any, storeIndex?: number }) => void, (reason: any) => void]> = new Map();
  #sk?: string;
  readonly id: number = sbId++;
  state: State = State.Initing;

  private __onmessage = (...args: [MessageEvent]) => this.#acceptMessage(...args);
  constructor() {
    this.#mk = (10000000 + Math.floor(Math.random() * 89999999)).toString();
    this.#iframe = document.createElement('iframe');
    this.#iframe.style.display = 'none';
    this.#iframe.sandbox.value = 'allow-scripts';
    this.#iframe.srcdoc = sandboxHtml;
    document.body.appendChild(this.#iframe);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.#source = this.#iframe.contentWindow!;
    window.addEventListener('message', this.__onmessage);
  }

  init(): Promise<void> {
    if (typeof this.#sk === 'string') return Promise.resolve();
    return new Promise((rs) => this.#initWaitlist.push(rs));
  }

  /**用第一个参数定义一个函数，然后展开第二个参数调用新定义的函数。新函数使用`args`接收参数。 */
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
    const messageData = { ...data, mk: this.#mk, msgId: this.#msgId };
    this.#source.postMessage(messageData, '*');
    return this.#msgId++;
  }

  #acceptMessage(ev: MessageEvent) {
    if (ev.source !== this.#source)
      return;
    if (typeof this.#sk !== 'string') {
      if (ev.data?.type === 'init.ok') {
        this.#sk = ev.data.sk;
        this.#iframe.contentWindow?.postMessage({ type: 'init.ok', mk: this.#mk }, '*');
        this.state = State.Ready;
        this.#initWaitlist.forEach(v => v());
      }
    }
    if (ev.data?.sk !== this.#sk)
      return;
    switch (ev.data.type) {
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
    this.#iframe.remove();
    window.removeEventListener('message', this.__onmessage);
  }
}