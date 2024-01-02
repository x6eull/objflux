import { Folder } from '../Folder/Folder';
import { Input } from '../Input/Input';
import './ToolListPage.scss';
import { register } from './official';

const officialTools = register.tools;
export default function ToolListPage() {
  return (<div className='toollistpage'>
    <Input className='search' placeholder='搜索' />
    <Folder initialExpanded miniFolderIcon title='本地'>
      <span style={{ margin: '.2rem .5rem' }}>这些信息储存于localStorage，不会上传。清除浏览数据可能导致其丢失。</span>
      <ToolList />
    </Folder>
    <Folder initialExpanded miniFolderIcon title='内置'>
      <ToolList items={officialTools.map(t => { return { name: t.name, lastModified: t.lastModified, onclick() { location.pathname = `/tool/of/${t.name}` } } })} />
    </Folder>
  </div>);
}

function ToolList({ items = [] }: { items?: { name: string, lastModified?: Date, onclick?: () => void }[] }) {
  return (<div className='list'>
    <table>
      <thead><tr>
        <th scope='col' className='name'>名称</th>
        <th scope='col' className='last-modified'>修改日期</th>
      </tr></thead>
      <tbody>
        {items.map((i, index) => (<tr onClick={(ev) => {
          ev.preventDefault();
          i.onclick?.();
        }} key={index}>
          <td>{i.name}</td>
          <td>{i.lastModified?.toLocaleString() ?? ''}</td>
        </tr>))}
      </tbody>
    </table>
    {!items.length && (<div className='empty'>列表为空。</div>)}
  </div>);
}