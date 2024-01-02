import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';
import ErrorBoundary from '../utils/ErrorBoundary';

// eslint-disable-next-line react-refresh/only-export-components
const LazyBench = lazy(() => import('./Bench'));
export const benchRoute = {
  path: 'bench',
  element: <ErrorBoundary><LazyBench /></ErrorBoundary>
} satisfies RouteObject;