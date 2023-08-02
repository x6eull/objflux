import sandboxHtml from './sandbox.html?raw';

let sbId = 0;
export class Sandbox {
  #msgId = 0;
  readonly #iframe: HTMLIFrameElement;
  readonly #source: Window;
  readonly #mk: string;
  readonly #initWaitlist: (() => void)[] = [];
  readonly #evalWaitlist: Map<number, (value: any) => void> = new Map();
  #sk?: string;
  readonly id: number = sbId++;
  constructor() {
    this.#mk = (10000000 + Math.floor(Math.random() * 89999999)).toString();
    this.#iframe = document.createElement('iframe');
    this.#iframe.style.display = 'none';
    this.#iframe.sandbox.value = 'allow-scripts';
    this.#iframe.srcdoc = sandboxHtml;
    document.body.appendChild(this.#iframe);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.#source = this.#iframe.contentWindow!;
    window.addEventListener('message', (...args) => this.#acceptMessage(...args));
  }

  init(): Promise<void> {
    if (typeof this.#sk === 'string') return Promise.resolve();
    return new Promise((r) => this.#initWaitlist.push(r));
  }

  eval(code: string): Promise<any> {
    return new Promise((r) => {
      const i = this.#send(code, 'eval.code');
      this.#evalWaitlist.set(i, r);
    });
  }

  /**运行指定代码，并且将结果保存在沙箱内 */
  store(code: string): Promise<number> {
    return new Promise((r) => {
      const i = this.#send(code, 'store.code');
      this.#evalWaitlist.set(i, r);
    });
  }

  #send(data: any, type: string): number {
    this.#source.postMessage({ type, data, mk: this.#mk, msgId: this.#msgId }, '*');
    return this.#msgId++;
  }

  #acceptMessage(ev: MessageEvent) {
    if (ev.source !== this.#source)
      return;
    if (typeof this.#sk !== 'string') {
      if (ev.data?.type === 'init.ok') {
        this.#sk = ev.data.sk;
        this.#iframe.contentWindow?.postMessage({ type: 'init.ok', mk: this.#mk }, '*');
        this.#initWaitlist.forEach(v => v());
      }
    }
    if (ev.data?.sk !== this.#sk)
      return;
    switch (ev.data.type) {
      case 'eval.result': {
        const v = this.#evalWaitlist.get(ev.data.msgId);
        if (v) {
          v(ev.data.data);
          this.#evalWaitlist.delete(ev.data.msgId);
        }
        break;
      }
      case 'store.index': {
        const v = this.#evalWaitlist.get(ev.data.msgId);
        if (v) {
          v(ev.data.data);
          this.#evalWaitlist.delete(ev.data.msgId);
        }
        break;
      }
    }
  }

  dispose() {
    this.#iframe.remove();
    window.removeEventListener('message', this.#acceptMessage);
  }
}