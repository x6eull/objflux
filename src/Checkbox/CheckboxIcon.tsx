import { SVGProps } from 'react';

export function CheckboxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 100 100' stroke='#ffffff' fill='#00000000' strokeWidth={10} {...props}>
      <polyline points='20,55 50,80 80,20' className='line' pathLength={1} />
    </svg>);
}