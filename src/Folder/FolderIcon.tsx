import { SVGProps } from 'react';

export function FolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 100 100' stroke='#757575' strokeWidth={4} {...props}>
      <line x1={0} y1={25} x2={50} y2={75} />
      <line x1={100} y1={25} x2={50} y2={75} />
    </svg>);
}