import { SVGProps } from 'react';

export function CheckboxIcon(props: SVGProps<SVGSVGElement>) {
  return (<svg viewBox='0 0 100 100' stroke='white' fill='transparent' strokeWidth={8} {...props}>
    <polyline points='16,50 45,75 86,25' className='line' pathLength={1} />
  </svg>);
}