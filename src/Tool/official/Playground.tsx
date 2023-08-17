import { useEffect, useState } from 'react';
import { parseCode } from '../../service/parse';
import { AutoTool } from '../AutoTool';
import { Sandbox } from '../../service/Sandbox';

export function Playground({ source }: { source: string }) {
  const [sandbox] = useState(() => new Sandbox());
  const [result, setResult] = useState<React.ReactNode>(() => <div>Loading...</div>);
  useEffect(() => {
    try {
      const { emitedText, exportName, para } = parseCode(source);
      (async () => {
        try {
          const res = await sandbox.eval({ body: 'const et = args[0],en = args[1];return import(`data:text/javascript,${encodeURIComponent(et)}`).then(m=>m[en]??m.default);', args: [emitedText, exportName], doStore: true, doAwait: true, doReturn: false });
          const id = res.storeIndex;
          setResult(<AutoTool tool={{
            name: '__dev_playground_tool',
            input: para,
            config: {},
            output: { keyword: 'react.element', restriction: {} },
            async func(...values) {
              const output = await sandbox.eval({ withStore: id, body: 'return store(...args)', doReturn: true, doStore: false, doAwait: false, args: values });
              return (<>{JSON.stringify(output.result)}</>);
            }
          }} />);
        } catch (err: any) {
          setResult(<>未通过javascript语法检查: {err?.message ?? '未知错误'}</>);
        }
      })();
    } catch (err: any) {
      setResult(<>未通过typescript语法检查或存在不能识别的语法: {err?.message ?? '未知错误'}</>);
    }
  }, [source, sandbox]);

  return <div>
    <p style={{ margin: '.3rem .8rem', color: '#00b8ff' }}>目前仅接受string类型的参数。返回值使用JSON.stringify编码后显示。</p>
    {result}</div>;
}