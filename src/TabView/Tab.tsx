import { PointerManager } from '../utils/PointerManager';
import './Tab.scss';

import { useRef, useState } from 'react';

export function Tab({ title, children }: { title: string, children: React.ReactNode }) {
  const ref = useRef<HTMLLegendElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [x, setX] = useState(100);
  const [y, setY] = useState(100);
  return (<fieldset style={{ position: 'fixed', left: x + 'px', top: y + 'px' }} className="tab">
    <PointerManager><legend ref={ref} onPointerDown={(e) => {
      return;
      if (!e.isPrimary)
        return;
      if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)
        return;
      setIsDown(true);
      ref.current?.requestPointerLock();
    }} onPointerUp={(e) => {
      return;
      if (!e.isPrimary)
        return;
      setIsDown(false);
      document.exitPointerLock();
    }} onPointerMove={(e) => {
      if (!isDown)
        return;
      if (!e.isPrimary)
        return;
      setX(x + e.movementX);
      setY(y + e.movementY);
    }} className="title">{title}</legend>
    </PointerManager>

    <div className="content">{children}</div>
  </fieldset>);
}