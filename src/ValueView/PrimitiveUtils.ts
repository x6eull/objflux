export function trimOverlongString(from: string): { trimmed: true; start: string; end: string; outline: string; } | { trimmed: false; } {
  const maxLength = 100;
  const length = from.length;
  if (length > maxLength) {
    const start = from.substring(0, 50);
    const end = from.substring(length - 50);
    const outline = `${start}…${end}`;
    return { trimmed: true, start, end, outline };
  }
  else return { trimmed: false };
}
export function getStringOutline(from: string) {
  const trimResult = trimOverlongString(from);
  return trimResult.trimmed ? trimResult.outline : from;
}