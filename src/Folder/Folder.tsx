import { useState, useContext } from 'react';
import { FolderIcon } from './FolderIcon';
import './Folder.scss';
import { FolderLevelContext } from './FolderLevelContext';

/**
 * 折叠组件。
 * 此组件不受控，除第一次渲染外，`initialExpanded`会被忽略。
 */
export function Folder
  ({ title = '选项', desc, children, initialExpanded = false, onChange }: { title?: string, desc?: string, children?: React.ReactNode, initialExpanded?: boolean, onChange?: (expanded: boolean) => void }) {
  const [expanded, setExpanded] = useState<boolean>(initialExpanded);
  const level = useContext(FolderLevelContext);
  return (
    <div className={'folder' + (level > 0 ? ' nested' : '')}>
      <div style={level > 0 ? { paddingLeft: `${(level + 1) * 1.2}rem` } : {}} className={'control-card' + (expanded ? ' expanded' : '')} onClick={() => {
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
        <FolderLevelContext.Provider value={level + 1}>
          {children}
        </FolderLevelContext.Provider>
      </div>
    </div>);
}