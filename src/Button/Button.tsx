import { DetailedHTMLProps, HTMLAttributes } from 'react';
import './Button.scss';

export function Button({ title, onClick, ...oProps }: { title: string, onClick?: React.MouseEventHandler<HTMLDivElement> } & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  return (<div {...oProps} onClick={onClick} className='button'>{title}</div>);
}