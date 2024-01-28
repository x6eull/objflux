import { useMemo } from 'react';
import { TokenBase } from './ValueView';
import { getStringOutline } from './PrimitiveUtils';

export function NullToken() {
  return (<TokenBase className='null'>null</TokenBase>);
}
export function UndefinedToken() {
  return (<TokenBase className='undefined'>undefined</TokenBase>);
}
export function BooleanToken({ value }: { value: boolean }) {
  return (<TokenBase className='boolean'>{value ? 'true' : 'false'}</TokenBase>);
}
export function NumberToken({ value }: { value: number }) {
  return (<TokenBase className='number'>{value.toString()}</TokenBase>);
}
export function BigIntToken({ value }: { value: bigint }) {
  return (<TokenBase className='bigint'>{value.toString()}n</TokenBase>);
}
export function StringToken({ value }: { value: string }) {
  const outline = useMemo(() => getStringOutline(value), [value]);
  return (<TokenBase className='string'>'{outline}'</TokenBase>);
}
export function SymbolToken({ value }: { value: symbol }) {
  const desc = value.description ?? '';
  const descOutline = useMemo(() => getStringOutline(desc), [desc]);
  return (<TokenBase className='symbol'>Symbol({descOutline})</TokenBase>);
}