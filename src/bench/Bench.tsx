import { AutoToken } from '../ValueView/ValueView';
import './Bench.scss';

export default function Bench() {
  return (<div className='bench'>
    <ValueList items={['此功能尚在开发'.padEnd(101, 'a'), 123.456, true, false, null, undefined, 2n ** 63n, Symbol('\'"`'), { a: 1, b: Symbol(), c: { cc: { ccc: {} } } }]} />
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