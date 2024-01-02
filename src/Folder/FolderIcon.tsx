import { SVGProps } from 'react';

export function FolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 100 100' stroke='#757575' strokeWidth={6} {...props}>
      <polyline fill='none' points='0,25 50,75 100,25' />
    </svg>);
}