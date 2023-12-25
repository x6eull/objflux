import { useEffect, useState } from 'react';
import { parseCode } from '../../service/parse';
import { AutoTool } from '../AutoTool';
import { Sandbox } from '../../sandbox/Sandbox';

export function Playground({ source }: { source: string }) {
  const [result, setResult] = useState<React.ReactNode>(() => <div>Loading...</div>);
  useEffect(() => {
    const sandbox = new Sandbox();
    try {
      const { emitedText, exportName, para } = parseCode(source);
      (async () => {
        try {
          const res = await sandbox.eval({ body: 'const et = args[0],en = args[1];return import(`data:text/javascript,${encodeURIComponent(et)}`).then(m=>m[en]??m.default);', args: [emitedText, exportName], doStore: true, doAwait: true, doReturn: false }).catch((err) => setResult(<>运行时出错：{err?.message ?? '未知错误'}</>)).timeout(500, '定义计算函数');
          if (typeof res !== 'object')
            return;
          const id = res.storeIndex;
          setResult(<AutoTool tool={{
            name: '__dev_playground_tool',
            input: para,
            config: {},
            output: { keyword: 'react.element' },
            async func(...values) {
              const output = await sandbox.eval({ withStore: id, body: 'return store(...args)', doReturn: true, doStore: false, doAwait: false, args: values }).timeout(100, '调用计算函数');
              return (<>{JSON.stringify(output.result)}</>);
            }
          }} />);
        } catch (err: any) {
          sandbox.dispose();
          setResult(<>未通过javascript语法检查: {err?.message ?? '未知错误'}</>);
        }
      })();
      return () => sandbox.dispose();
    } catch (err: any) {
      sandbox.dispose();
      setResult(<>未通过typescript语法检查或存在不能识别的语法: {err?.message ?? '未知错误'}</>);
    }
  }, [source]);

  return <div>
    <p style={{ margin: '.3rem .8rem', color: '#00b8ff' }}>目前仅接受string类型的参数。返回值使用JSON.stringify编码后显示。</p>
    {result}</div>;
}