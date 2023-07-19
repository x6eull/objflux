import { useContext, useState } from 'react';
import './Checkbox.scss';
import { FolderLevelContext } from '../Folder/FolderLevelContext';
import { CheckboxIcon } from './CheckboxIcon';

//TODO 选中/未选中的视觉效果（含动画）
/**
 * 复选框。
 * 此组件可以受控（指定`checked`则受控）。
 */
export function Checkbox({ title, desc, initialChecked, checked, onChange }: { title: string, desc?: string, initialChecked?: boolean, checked?: boolean, onChange?: (checked: boolean) => void }) {
  const level = useContext(FolderLevelContext);
  const [stateChecked, setStateChecked] = useState<boolean>(initialChecked ?? false);
  checked ??= stateChecked;
  return (<div style={{ paddingLeft: `${(level + 1) * 1.2}rem` }} className='checkbox' onClick={() => {
    const nChecked = !checked;
    setStateChecked(nChecked);
    onChange?.(nChecked);
  }}>
    <div className={'mark' + (checked ? ' checked' : '')}>
      <div className='inner'>
        <CheckboxIcon />
      </div>
    </div>
    <div className='text'>
      <div className='title'>{title}</div>
      {desc ? (<div className='desc'>{desc}</div>) : (<></>)}
    </div>
  </div>);
}