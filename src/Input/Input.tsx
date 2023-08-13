import { DetailedHTMLProps, useContext, useState } from 'react';
import './Input.scss';
import { FolderLevelContext } from '../Folder/FolderLevelContext';

/**
 * 输入框。
 * 此控件可以受控（指定`value`则受控）
 */
export function Input(
    { title, desc, initialValue, value, onChange, allowMultiline, placeholder, error, seperateTitleWithInput, seperateTitleWithDescription, viewLines, required }:
        { title: string, desc?: string, initialValue?: string, value?: string, onChange?: (value: string) => void, placeholder?: string, error?: boolean, seperateTitleWithInput?: boolean, seperateTitleWithDescription?: boolean, required?: boolean } &
        ({ allowMultiline?: false, viewLines?: never } |
        { allowMultiline: true, viewLines?: number })
) {
    allowMultiline ??= false;
    placeholder ??= '';
    viewLines ??= 3;
    const level = useContext(FolderLevelContext);
    const [stateValue, setStateValue] = useState<string>(initialValue ?? '');
    value ??= stateValue;
    type InputElement = HTMLInputElement | HTMLTextAreaElement;
    const eleProps: DetailedHTMLProps<React.HTMLProps<InputElement>, InputElement> = {
        value,
        placeholder,
        className: 'inputele' + (error ? ' error' : ''),
        onInput(e: React.FormEvent<InputElement>) {
            const nValue = (e.target as InputElement).value;
            setStateValue(nValue);
            onChange?.(nValue);
        },
        required,
        spellCheck: 'false',
        autoComplete: 'off',
        autoCapitalize: 'none'
    };
    return <div style={{ paddingLeft: `${(level + 1) * 1.2}rem` }} className={'input' + (allowMultiline ? ' multiline' : '') + (seperateTitleWithInput ? ' seperated-input' : '')}>
        <div className={'text' + (seperateTitleWithDescription ? ' seperated-text' : '')}>
            <div className='title'>{title}</div>
            {desc ? (<div className='desc'>{desc}</div>) : (<></>)}
        </div>
        {allowMultiline ? <textarea {...(eleProps as DetailedHTMLProps<React.HTMLProps<HTMLTextAreaElement>, HTMLTextAreaElement>)} rows={viewLines} /> : <input {...(eleProps as DetailedHTMLProps<React.HTMLProps<HTMLInputElement>, HTMLInputElement>)} />}
    </div >;
}
