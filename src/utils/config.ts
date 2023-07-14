const c: { [k: string]: unknown } = {};
Reflect.defineProperty(window, 'dc', {
  value: c,
  writable: false,
  configurable: false,
  enumerable: true
});

export function readConfig(key: string): string | null {
  if (key in c)
    return String(c[key]);
  const s = sessionStorage.getItem(key);
  if (s !== null)
    return s;
  const l = localStorage.getItem(key);
  if (l !== null)
    return l;
  return null;
}