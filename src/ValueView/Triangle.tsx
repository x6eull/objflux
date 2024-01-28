export default function Triangle({ empty = false, ...otherProps }: React.HTMLProps<SVGSVGElement> & { empty?: boolean }) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" style={{ opacity: empty ? 0 : undefined, flexShrink: 0 }} {...otherProps}><path d="M7.571 11.84C6.908 12.3 6 11.827 6 11.024V4.976c0-.803.908-1.275 1.571-.816l3.784 2.616a1.486 1.486 0 0 1 0 2.448L7.571 11.84Z" fill="#212121" /></svg>);
  //另一方向三角形
  //M20.957 5a1 1 0 0 0-.821 1.571l2.633 3.784a1.5 1.5 0 0 0 2.462 0l2.633-3.784A1 1 0 0 0 27.043 5h-6.086Z
}