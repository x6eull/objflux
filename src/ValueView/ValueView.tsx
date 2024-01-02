import { combineTokens } from '../utils/utils';
import './ValueView.scss';

export function TokenBase({ className, children }: { className?: string, children: string | string[] }) {
  return (<span className={combineTokens('token', className)}>{children}</span>);
}

export function NumberToken({ value, children }: { value?: number, children?: string }) {
  return (<TokenBase className='number'>{(value ?? Number(children) ?? 0).toString()}</TokenBase>);
}

export function UndefinedToken() {
  return (<TokenBase className='undefined'>undefined</TokenBase>);
}
export function NullToken() {
  return (<TokenBase className='null'>null</TokenBase>);
}

export function StringToken({ value, children }: { value?: string, children?: string }) {
  return (<TokenBase className='string'>'{value ?? children ?? ''}'</TokenBase>);
}

export function AutoToken({ value }: { value: any }) {
  let result;
  if (value === undefined)
    result = <UndefinedToken />;
  else if (value === null)
    result = <NullToken />;
  else if (typeof value === 'string')
    result = <StringToken value={value} />;
  else if (typeof value === 'number')
    result = <NumberToken value={value} />;
  else throw new Error('Unsupported Token');
  return result;
}