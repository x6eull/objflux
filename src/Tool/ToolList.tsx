import { Folder } from '../Folder/Folder';
import { Input } from '../Input/Input';
import './ToolList.scss';

export default function ToolList() {
  return (<div className='toollist'>
    <Input className='search' placeholder='搜索' />
    <Folder initialExpanded miniFolderIcon title='本地'>
      本地工具储存于localStorage，不会上传。清除浏览数据可能导致其丢失。
    </Folder>
    <Folder initialExpanded miniFolderIcon title='内置'>
      内置工具由objflux团队提供。
    </Folder>
  </div>);
}