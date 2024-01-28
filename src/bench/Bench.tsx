import { useState } from 'react';
import { AutoToken } from '../ValueView/ValueView';
import './Bench.scss';
import { Input } from '../Input/Input';

export default function Bench() {
  const [input, setInput] = useState('(()=>{return {a:10,b:{bb:{bbb:{}}}}})()');
  const [values, setValues] = useState<any[]>(['测试中,沙箱外执行js']);
  return (<div className='bench'>
    <ValueList items={values} />
    <Input onKeyDown={(ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (ev.code === 'Enter') {
        ev.preventDefault();
        try {
          const newV = eval(input);
          setInput('');
          setValues([...values, newV]);
        } catch (e: unknown) {
          setInput('');
          setValues([...values, e]);
        }
      }
    }} value={input} onChange={(i: string) => { setInput(i) }}></Input>
  </div>);
}

function ValueList({ items }: { items: any[] }) {
  return (<ol className='value-list'>
    {items.map((i, index) => (<li key={index} className='item'>
      <div className='col-tag'>{index + 1}</div>
      <div className='value'><AutoToken value={i} /></div>
    </li>))}
  </ol>);
}