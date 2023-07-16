import { useState } from 'react';
import { FolderIcon } from './FolderIcon';
import './Folder.scss';

export function Folder
  ({ title = '选项', desc, children, initialExpanded = false, onChange }: { title?: string, desc?: string, children?: React.ReactNode, initialExpanded?: boolean, onChange?: (expanded: boolean) => void }) {
  const [expanded, setExpanded] = useState<boolean>(initialExpanded);
  return (
    <div className={'moption'}>
      <div className={'control-card' + (expanded ? ' expanded' : '')} onClick={() => {
        const e = !expanded;
        setExpanded(e);
        onChange?.(e);
      }}>
        <div className='text'>
          <div className='title'>{title}</div>
          {desc ? (<div className='desc'>{desc}</div>) : undefined}
        </div>
        <div className={'icon' + (expanded ? ' expanded' : '')}><FolderIcon className='inner' /></div>
      </div>
      <div className={'content-card' + (expanded ? ' expanded' : '')}>
        {children}
      </div>
    </div>);
}