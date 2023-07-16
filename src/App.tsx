import React, { Suspense } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import './main.scss';
import { IndexElement } from './Index/Index';
import { Header } from './Header/Header';
// import './dev/convert';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <><Header />出错了</>,
    element: (<>
      <Header />
      <div className='content'>
        <Outlet />
      </div>
    </>),
    children: [
      { path: '', element: <IndexElement /> },
      {
        path: 'explore', element: <Suspense>
          <div style={{ display: 'flex', 'flexDirection': 'column', width: '100%', height: '100%' }}>
          </div>
        </Suspense>
      }
    ]
  },
]);

export default function App() {
  return (<React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>);
}