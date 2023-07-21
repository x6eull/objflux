import { useContext, useState } from 'react';
import './Input.scss';
import { FolderLevelContext } from '../Folder/FolderLevelContext';

/**
 * 输入框。
 * 此控件可以受控（指定`value`则受控）
 */
export function Input(
    { title, desc, initialValue, value, onChange, type }:
        { title: string, desc?: string, initialValue?: string, value?: string, onChange?: (value: string) => void, type?: 'text' | 'number' }
) {
    type = type ? type : 'text';
    const level = useContext(FolderLevelContext);
    const [stateValue, setStateValue] = useState<string>(initialValue ?? '');
    value ??= stateValue;
    return <div style={{ paddingLeft: `${(level + 1) * 1.2}rem` }}>
        <div className='text'>
            <div className='title'>{title}</div>
            {desc ? (<div className='desc'>{desc}</div>) : (<></>)}
        </div>
        <input type={type} value={value} onChange={e => {
                setStateValue(e.target.value);
                onChange?.(e.target.value ?? '');

                console.log(e.target.value);
            }} />
    </div>;
}
