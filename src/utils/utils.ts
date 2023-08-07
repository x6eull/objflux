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

let incrementalId = 0;
export function newId() {
  return incrementalId++;
}

declare global {
  interface Object {
    withClass(c: string): StringRecord;
  }
}

export type AnyRecord = Record<string | number | symbol, any>;
export type StringRecord<V = any> = Record<string, V>;
export type RecordNever<K extends string | number | symbol = string> = Record<K, never>;