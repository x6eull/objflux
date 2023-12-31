import { Input } from '../Input/Input';
import './ToolList.scss';

export default function ToolList() {
  return (<div className='toollist'>
    <Input className='search' placeholder='搜索' />
  </div>);
}