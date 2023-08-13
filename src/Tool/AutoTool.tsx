import { useMemo, useState } from 'react';
import { Input } from '../Input/Input';
import { Parameter, Tool, InputType } from '../service/type';
import { StringRecord } from '../utils/utils';
import './AutoTool.scss';

function getDefaultValue(type: InputType) {
  if (type.keyword === 'optional')
    type = type.base;
  switch (type.keyword) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'object': {
      const v: StringRecord = {};
      for (const [mn, mt] of Object.entries(type.members))
        if ('default' in mt)
          v[mn] = mt.default;
        else
          v[mn] = getDefaultValue(mt);
      return v;
    }
    default:
      return undefined;
  }
}

export function AutoTool({ tool }: { tool: Tool }) {
  let { input, func, output } = tool;
  const def = useMemo(() => input.map((i) => getDefaultValue(i.type)), [input]);
  const [values, setValues] = useState(def);
  let outputToRender;
  switch (output.keyword) {
    case 'optional':
      //TODO 处理可选输出
      output = output.base;
    // falls through
    case 'react.element':
      outputToRender = func(...values);
      break;
    default:
      throw new Error('暂不支持此输出类型');
  }
  return (<div className='autotool'>
    <div className='form'>
      {input.map((p, i) => <AutoPara onChange={(nV) => {
        values[i] = nV;
        setValues([...values]);
      }} value={values[i]} key={p.devName ?? p.displayName} para={p} />)}
    </div>
    <div className='result'>
      {outputToRender}
    </div>
  </div>);
}

function AutoPara({ para, value, onChange }: { para: Parameter, value: any, onChange: (v: any) => void }) {
  let { type, displayName } = para;
  let required = true;
  if (type.keyword === 'optional') {
    required = false;
    type = type.base;
  }
  //TODO 处理其他类型的输入
  switch (type.keyword) {
    case 'string': {
      let ml = false, vl: number | undefined = undefined;
      const rMl = type.restriction.multiLine;
      switch (typeof rMl) {
        case 'undefined':
          break;
        case 'boolean':
          if (rMl) {
            ml = true;
            vl = 3;
          }
          break;
        case 'number':
          ml = true;
          vl = rMl;
          break;
        default:
          throw new Error('无效的multiLine约束');
      }
      return (<Input allowMultiline={ml as any} viewLines={vl as any} onChange={onChange} value={String(value)} title={displayName} required={required} />);
    }
    default:
      throw new Error('暂不支持此输入类型');
  }
}