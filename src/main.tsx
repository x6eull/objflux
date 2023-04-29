import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from 'react-router-dom';
import './main.scss';
import { IndexElement } from './Index/Index';
import { Header } from './Header/Header';

export const DocsUrl = '/';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <><Header />载入时出现错误</>,
    element: (<>
      <Header />
      <Outlet />
    </>),
    children: [
      { path: '', element: <IndexElement /> }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
