import { useContext, useState } from 'react';
import { FolderLevelContext } from '../Folder/FolderLevelContext';
import './OptionGroup.scss';

/**
 * 单选项列表。
 * 此组件可以受控。如果指定了`current`，则根据`current`显示选中项，否则从state中获取。
 */
export function OptionGroup({ options, initialCurrent, current, onChange }: { options: ({ title: string, desc?: string } | string)[], initialCurrent?: number, current?: number, onChange?: (i: number) => void }) {
  const sel = options.map(s => typeof s === 'string' ? { title: s } : s);
  const level = useContext(FolderLevelContext);
  const [stateCurrent, setStateCurrent] = useState<number>(initialCurrent ?? 0);
  current ??= stateCurrent;
  return (<ul className='option-group'>
    {sel.map((s, i) => (<li style={{ paddingLeft: `${(level + 1) * 1.2}rem` }} className={'option' + (i === current ? ' selected' : '')} key={i} onClick={() => {
      setStateCurrent(i);
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