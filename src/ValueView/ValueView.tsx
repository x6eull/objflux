import { ReactNode, useMemo, useState } from 'react';
import { combineTokens } from '../utils/utils';
import Triangle from './Triangle';
import './ValueView.scss';
import { NullToken, UndefinedToken, BooleanToken, NumberToken, BigIntToken, SymbolToken, StringToken } from './PrimitiveToken';

export function TokenBase({ className, children, onClick, useOl }
  : {
    className?: string, children: string | string[] | ReactNode
  } & ({
    onClick?: React.MouseEventHandler<HTMLPreElement>,
    useOl?: false
  } | {
    onClick?: React.MouseEventHandler<HTMLOListElement>,
    useOl: true
  })) {
  return useOl ? (<ol onClick={onClick} className={combineTokens('token', className)}>{children}</ol>) : (<pre onClick={onClick} className={combineTokens('token', className)}>{children}</pre>);
}

export function Separator() {
  return (<span className='separator'>: </span>);
}

export function Prop({ name, value }: { name: string, value: any }) {
  const [expanded, setExpanded] = useState(false);
  const isObj = typeof value === 'object' && value !== null;
  return (<li onClick={(ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (isObj)
      setExpanded(!expanded);
  }} className='prop'>
    <Triangle empty={!isObj} className={'icon' + (expanded ? ' expanded' : '')} />
    <div className='value-content'>
      <div className='preview'>
        <pre className='key'>{name}</pre>
        <Separator />
        <AutoToken propExpanded={false} value={value} /></div>
      {isObj && expanded ? <ObjectDetail value={value} /> : <></>}
    </div>
  </li>);
}


export function ObjectDetail({ value }: { value: object }) {
  return (<ol onClick={(ev) => {
    ev.preventDefault();
    ev.stopPropagation();
  }} className='detail'>
    {Reflect.ownKeys(value)
      .map((key, index) => {
        let propValue;
        try {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const propDesc = Object.getOwnPropertyDescriptor(value, key)!;
          if (propDesc.get)
            propValue = propDesc.get.call(value);
          else
            propValue = propDesc.value;
        }
        catch (e) { propValue = 'error:' + e }
        return (<Prop key={index} name={String(key)}
          value={propValue} />);
      })
      .concat([<Prop key={-1} name='[[Prototype]]' value={Reflect.getPrototypeOf(value)} />])}
  </ol>);
}

export function ObjectToken({ value, expanded, onClick, mapPrototype = false, showTriangle = true }
  : { value: object, expanded?: boolean, onClick?(newExpanded: boolean): void, mapPrototype?: boolean, showTriangle?: boolean }) {
  const preview: ReactNode = useMemo(() => {
    if (mapPrototype) {
      const map: Record<string, object> = {
        Object: Object.prototype
      };
      for (const [k, v] of Object.entries(map)) {
        if (value === v)
          return k;
      }
    }
    try {
      return JSON.stringify(value);
    } catch (e: any) {
      return `[stringify failed: ${e?.message ?? String(e)}]`;
    }
  }, [mapPrototype, value]);
  return (<TokenBase className='object' onClick={(ev) => {
    if (!onClick) return;
    ev.preventDefault();
    ev.stopPropagation();
    onClick(!expanded);
  }}>
    <div className='icon-container'>
      {showTriangle ? <Triangle className={'icon' + (expanded ? ' expanded' : '')} /> : <></>}
    </div>
    <div className='content'>
      <pre className='preview'>{preview}</pre>
      {expanded ? <ObjectDetail value={value} /> : (<></>)}
    </div>
  </TokenBase>);
}

export function AutoToken({ value, propExpanded }
  : { value: any, propExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isPropValue = typeof propExpanded === 'boolean';
  let result;
  if (value === null)
    result = <NullToken />;
  else if (value === undefined)
    result = <UndefinedToken />;
  else if (typeof value === 'boolean')
    result = <BooleanToken value={value} />;
  else if (typeof value === 'number')
    result = <NumberToken value={value} />;
  else if (typeof value === 'bigint')
    result = <BigIntToken value={value} />;
  else if (typeof value === 'string')
    result = <StringToken value={value} />;
  else if (typeof value === 'symbol')
    result = <SymbolToken value={value} />;
  else if (typeof value === 'object')
    result = <ObjectToken showTriangle={!isPropValue} mapPrototype={isPropValue}
      expanded={propExpanded ?? expanded} onClick={isPropValue ? undefined : setExpanded} value={value} />;
  else result = <span style={{ color: '#ee000077' }}>{String(value)}</span>;
  // else throwErr('Unsupported Token', value);
  return result;
}