import { type RouteObject } from 'react-router-dom';
import LazyComponent from '../utils/LazyComponent';

export const benchRoute = {
  path: 'bench',
  element: <LazyComponent factory={() => import('./Bench')} />
} satisfies RouteObject;