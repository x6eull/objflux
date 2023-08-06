import { Tool, User } from '../service/Tool';
import './ToolViewer.scss';
import { useLoaderData } from 'react-router-dom';
import { AutoTool } from './AutoTool';

/**通用工具模块，展示一个工具的基本信息和生成的UI */
export default function ToolViewer() {
  //TODO 添加工具的信息栏
  const { author, tool } = useLoaderData() as { author: User, tool: Tool };
  return (<div className='toolviewer'>
    <div className='infobar'>{author.username} / {tool.name}</div>
    <div className='content'><AutoTool tool={tool} /></div>
  </div>);
}