import { useContext, useState } from 'react';
import './Input.scss';
import { FolderLevelContext } from '../Folder/FolderLevelContext';

/**
 * 输入框。
 * 此控件可以受控（指定`value`则受控）
 */
export function Input(
    { title, desc, initialValue, value, onChange, allowMultiline, placeholder, error, seperateTitleWithInput, seperateTitleWithDescription, minViewLines, maxViewLines }:
        { title: string, desc?: string, initialValue?: string, value?: string, onChange?: (value: string) => void, allowMultiline?: boolean, placeholder?: string, error?: boolean, seperateTitleWithInput?: boolean, seperateTitleWithDescription?: boolean, minViewLines?: number, maxViewLines?: number }
) {
    allowMultiline ??= false;
    seperateTitleWithInput ??= false;
    placeholder ??= '';
    minViewLines ??= 1;
    maxViewLines ??= 5;

    minViewLines = Math.max(minViewLines, 1);
    maxViewLines = Math.max(maxViewLines, minViewLines);

    const level = useContext(FolderLevelContext);
    const [stateValue, setStateValue] = useState<string>(initialValue ?? '');
    value ??= stateValue;
    return <div style={{ paddingLeft: `${(level + 1) * 1.2}rem` }} className={'input' + (allowMultiline ? ' multiline-input' : '') + (seperateTitleWithInput ? ' seperated-input' : '')}>
        <div className={'text' + (seperateTitleWithDescription ? ' seperated-text' : '')}>
            <div className='title'>{title}</div>
            {desc ? (<div className='desc'>{desc}</div>) : (<></>)}
        </div>
        {allowMultiline ? (<textarea placeholder={placeholder} className={'textarea' + (error ? ' error' : '')} onChange={e => {
            let _result = e.target.value;
            _result = allowMultiline ? _result : _result.replace(/\n/g, '');

            setStateValue(_result);
            onChange?.(_result ?? '');
        }} style={{
            height: `${(Math.max(
                Math.min(
                    value.length - value.replace(/\n/g, '').length + 1,
                    maxViewLines
                ),
                minViewLines
            )) * 1.5}em`
        }}>
            {value}
        </textarea>) : (<input placeholder={placeholder} className={'textarea' + (error ? ' error' : '')} value={value} onChange={e => {
            let _result = e.target.value;
            _result = allowMultiline ? _result : _result.replace(/\n/g, '');

            setStateValue(_result);
            onChange?.(_result ?? '');
        }} />)}
    </div>;
}
