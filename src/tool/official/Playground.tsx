import { useEffect, useState } from 'react';
import { parseCode } from '../../core/parse';
import { AutoTool } from '../AutoTool';
import { Sandbox } from '../../sandbox/Sandbox';
import { AutoToken } from '../../ValueView/ValueView';

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
          const storedFuncIndex = res.storeIndex;
          setResult(<AutoTool tool={{
            name: '__dev_playground_tool',
            input: para,
            config: {},
            output: { keyword: 'react.element' },
            async func(...values) {
              const output = await sandbox.eval({ withStore: [storedFuncIndex], body: 'return store[0](...args)', doReturn: true, doStore: false, doAwait: false, args: values }).timeout(100, '调用计算函数');
              return (<><AutoToken value={output.result} /></>);
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

  return <div>{result}</div>;
}