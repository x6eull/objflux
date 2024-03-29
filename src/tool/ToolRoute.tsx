import { Outlet, RouteObject, useRouteError } from 'react-router-dom';
import ToolViewer from './ToolViewer';
import { get, load } from './loader';
import { register as officlaRegister } from './official';
import LazyComponent from '../utils/LazyComponent';

load(officlaRegister);
export const toolRoute: RouteObject =
{
  path: 'tool',
  errorElement: <ToolError />,
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <LazyComponent factory={() => import('./ToolListPage.tsx')} />
    },
    {
      //考虑修改路径样式，加/u/或/t/ ?
      path: ':user/:toolid',
      loader({ params }) {
        const { user: username, toolid } = params as { user: string, toolid: string };
        //TODO fetch
        const { user: author, tool } = get(username, toolid) ?? {};
        if (!tool)
          throw new Error('指定的用户或工具不存在');
        return { author, tool };
      },
      element: (<ToolViewer />)
    }
  ]
};

// eslint-disable-next-line react-refresh/only-export-components
function ToolError() {
  const errMsg = (useRouteError() as Error | undefined)?.message ?? '未知错误';
  return (<div>载入子模块时出错: {errMsg}</div>);
}
