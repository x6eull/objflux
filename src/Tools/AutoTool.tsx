import { useMemo, useState } from 'react';
import { Input } from '../Input/Input';
import { Parameter, Tool, ValidInputType } from '../service/Tool';
import { StringRecord } from '../utils/utils';
import './AutoTool.scss';

function getDefaultValue(type: ValidInputType) {
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
        v[mn] = getDefaultValue(mt);
      return v;
    }
    default:
      return undefined;
  }
}

export function AutoTool({ tool }: { tool: Tool }) {
  const { input } = tool;
  const def = useMemo(() => input.map((i) => getDefaultValue(i.type)), [input]);
  const [values, setValues] = useState(def);
  return (<form autoCapitalize='none' autoComplete='off' spellCheck={false} className='autotool'>
    {input.map((p, i) => <AutoPara onChange={(nV) => {
      values[i] = nV;
      setValues([...values]);
    }} value={values[i]} key={p.displayName} para={p} />)}
  </form>);
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
      return (<Input allowMultiline={type.restriction.multiLine} onChange={onChange} value={String(value)} title={displayName} required={required} />);
    }
    default:
      throw new Error('暂不支持此输入类型');
  }
}