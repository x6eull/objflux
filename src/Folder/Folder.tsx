import { useState, useContext } from 'react';
import { FolderIcon } from './FolderIcon';
import './Folder.scss';
import { FolderLevelContext } from './FolderLevelContext';

/**
 * 折叠组件。
 * 此组件不受控，除第一次渲染外，`initialExpanded`会被忽略。
 */
export function Folder
  ({ title = '未命名组', desc, children, initialExpanded = false, onChange, miniFolderIcon = false }: { title?: string, desc?: string, children?: React.ReactNode, initialExpanded?: boolean, onChange?: (expanded: boolean) => void, miniFolderIcon?: boolean }) {
  const [expanded, setExpanded] = useState<boolean>(initialExpanded);
  const level = useContext(FolderLevelContext);
  function toggleExpanded(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    ev.stopPropagation();
    ev.preventDefault();
    const e = !expanded;
    setExpanded(e);
    onChange?.(e);
  }
  return (
    <div className={'folder' + (level > 0 ? ' nested' : '')}>
      <div style={level > 0 ? { paddingLeft: `${(level + 1) * 1.2}rem` } : {}} className={'control-card'
        + (expanded ? ' expanded' : '')
        + (miniFolderIcon ? ' mini-fold' : '')
      } onClick={(ev) => {
        if (miniFolderIcon)
          return;
        toggleExpanded(ev);
      }}>
        <div className='text'>
          <div className='title'>{title}</div>
          {desc ? (<div className='desc'>{desc}</div>) : undefined}
        </div>
        <div onClick={(ev) => {
          toggleExpanded(ev);
        }} className={'icon' + (expanded ? ' expanded' : '')}><FolderIcon className='inner' /></div>
      </div>
      <div className={'content-card' + (expanded ? ' expanded' : '')}>
        <FolderLevelContext.Provider value={level + 1}>
          {children}
        </FolderLevelContext.Provider>
      </div>
    </div>);
}