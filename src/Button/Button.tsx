import './Button.scss';

export function Button({ title, onClick }: { title: string, onClick?: React.MouseEventHandler<HTMLDivElement> }) {
  return (<div onClick={onClick} className='button'>{title}</div>);
}