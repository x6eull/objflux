import React, { Suspense } from 'react';
import { createBrowserRouter, isRouteErrorResponse, Outlet, RouterProvider, useRouteError } from 'react-router-dom';
import './main.scss';
import { IndexElement } from './Index/Index';
import { Header } from './Header/Header';
import { toolRoute } from './Tool/ToolRoute';

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
      { index: true, element: <IndexElement /> },
      {
        path: 'explore', element: (<Suspense>
          <div style={{ display: 'flex', 'flexDirection': 'column', width: '100%', height: '100%' }}>
          </div>
        </Suspense>)
      },
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