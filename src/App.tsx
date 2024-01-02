import React from 'react';
import { createBrowserRouter, isRouteErrorResponse, Navigate, Outlet, RouterProvider, useRouteError } from 'react-router-dom';
import './main.scss';
import { Header } from './Header/Header';
import { toolRoute } from './tool/ToolRoute';
import { benchRoute } from './bench/benchRoute';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <><Header /><ErrorElement /></>,
    element: (<>
      <Header />
      <div className='content'>
        <Outlet />
      </div>
    </>),
    children: [
      {
        index: true,
        path: '/',
        element: <Navigate to='/bench' />
      },
      {
        path: '/lib',
        element: <>此功能尚在开发</>
      },
      benchRoute,
      toolRoute
    ]
  },
]);

function ErrorElement() {
  const err = useRouteError();
  let msg;
  if (isRouteErrorResponse(err)) {
    if (err.status === 404)
      msg = '未找到该路径';
    else msg = '网络错误: ' + err.statusText;
  } else msg = err instanceof Error ? err.message : '发生了未知错误';
  return (<>{msg}</>);
}

export default function App() {
  return (<React.StrictMode>
    <style>{`:root{--dpr:${devicePixelRatio}}`}</style>
    <RouterProvider router={router} />
  </React.StrictMode>);
}