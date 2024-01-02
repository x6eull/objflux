import { AutoToken } from '../ValueView/ValueView';
import './Bench.scss';

export default function Bench() {
  return (<div className='bench'>
    <ValueList items={['此功能尚在开发', 123.456, null, undefined]} />
  </div>);
}

function ValueList({ items }: { items: any[] }) {
  return (<div className='value-list'>
    {items.map((i, index) => (<div key={index} className='item'>
      <div className='col-tag'>{index + 1}</div>
      <div className='value'><AutoToken value={i} /></div>
    </div>))}
  </div>);
}