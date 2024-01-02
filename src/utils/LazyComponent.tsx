import { ComponentType, ReactNode, Suspense, lazy, useMemo } from 'react';
import { StringRecord } from './utils';

export default function LazyComponent<T extends ComponentType<P>, P extends StringRecord = StringRecord>({ factory, props, fallback }:
  {
    factory: () => Promise<{ default: T; }>,
    props?: P,
    fallback?: ReactNode
  }
) {
  const Lazyed = useMemo(() => {
    console.log('lazy load using factory:', factory);
    return lazy(factory);
  }, [factory]);
  return (<Suspense fallback={fallback}><Lazyed {...(props as any)} /></Suspense>);
}