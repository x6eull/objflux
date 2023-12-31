import { DetailedHTMLProps, InputHTMLAttributes, useContext, useState } from 'react';
import './Input.scss';
import { FolderLevelContext } from '../Folder/FolderLevelContext';
import { combineTokens } from '../utils/utils';

/**
 * 输入框。
 * 此控件可以受控（指定`value`则受控）
 */
export function Input(
    { title, desc, initialValue, value, onChange, allowMultiline, placeholder, error, seperateTitleWithInput, seperateTitleWithDescription, viewLines, required, maxLength, type, className, ...otherProps }:
        { title?: string, desc?: string, initialValue?: string, value?: string, onChange?: (value: string) => void, placeholder?: string, error?: boolean, seperateTitleWithInput?: boolean, seperateTitleWithDescription?: boolean, required?: boolean, maxLength?: number, type?: 'text' | 'search' } &
        ({ allowMultiline?: false, viewLines?: never } |
        { allowMultiline: true, viewLines?: number }) &
        (DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> |
            DetailedHTMLProps<InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>)
) {
    allowMultiline ??= false;
    placeholder ??= '';
    viewLines ??= 3;
    type ??= 'text';
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
        spellCheck: false,
        autoCorrect: 'off',
        autoComplete: 'off',
        autoCapitalize: 'off',
        maxLength
    };
    return <div style={{ paddingLeft: `${(level + 1) * 1.2}rem` }} className={combineTokens('input' + (allowMultiline ? ' multiline' : '') + (seperateTitleWithInput ? ' seperated-input' : ''), className)}>
        <div className={'text' + (seperateTitleWithDescription ? ' seperated-text' : '')}>
            {title ? (<div className='title'>{title}</div>) : (<></>)}
            {desc ? (<div className='desc'>{desc}</div>) : (<></>)}
        </div>
        {allowMultiline ? <textarea {...(otherProps as any)} {...(eleProps as DetailedHTMLProps<React.HTMLProps<HTMLTextAreaElement>, HTMLTextAreaElement>)} rows={viewLines} /> : <input {...(otherProps as any)} type={type} {...(eleProps as DetailedHTMLProps<React.HTMLProps<HTMLInputElement>, HTMLInputElement>)} />}
    </div >;
}
