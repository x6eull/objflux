Object.defineProperties(Object.prototype, {
  withClass: {
    writable: true,
    enumerable: false,
    configurable: true,
    value(c: string) {
      const o = { ...this };
      if (o.className)
        o.className += ` ${c}`;
      else
        o.className = c;
      return o;
    }
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare interface Object {
  withClass(c: string): StringRecord;
}

export type AnyRecord = Record<string | number | symbol, any>;
export type StringRecord = Record<string, any>;