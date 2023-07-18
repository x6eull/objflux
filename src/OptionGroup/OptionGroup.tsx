import { useContext } from 'react';
import { FolderLevelContext } from '../Folder/FolderLevelContext';
import './OptionGroup.scss';

export function OptionGroup({ options, current = 0, onChange }: { options: ({ title: string, desc?: string } | string)[], current?: number, onChange?: (i: number) => void }) {
  const sel = options.map(s => typeof s === 'string' ? { title: s } : s);
  const level = useContext(FolderLevelContext);
  return (<ul className='option-group'>
    {sel.map((s, i) => (<li style={{ paddingLeft: `${(level + 1) * 1.2}rem` }} className={'option' + (i === current ? ' selected' : '')} key={i} onClick={() => {
      onChange?.(i);
    }}>
      <div className='line-decoration' />
      <div className='text'>
        <div className='title'>{s.title}</div>
        {s.desc ? (<div className='desc'>{s.desc}</div>) : (<></>)}
      </div>
    </li>))}
  </ul>);
}