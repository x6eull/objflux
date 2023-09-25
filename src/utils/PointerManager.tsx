import React, { useMemo } from 'react';
import { scopedVar } from './utils';

export function PointerManager({ children }: { children: React.ReactNode }) {
  const { get: _getOn, set: setOn } = useMemo(() => scopedVar(false), []);
  return <div onPointerDown={() => {
    setOn(true);
  }}>{children}</div>;
}