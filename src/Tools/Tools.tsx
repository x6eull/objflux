import { useState, useEffect } from 'react';
import './Tools.scss';
import { Sandbox } from '../service/Sandbox';

export default function Tools() {
  const [sb, setSb] = useState<Sandbox>();
  useEffect(() => {
    const s = new Sandbox();
    setSb(s);
    (window as any).sandbox = s;
    return s.dispose.bind(s);
  }, []);
  return (<div className='tools'>
    Page:Tools<br />Using sandbox{sb?.id}<br />window.sandbox is available
  </div>);
}