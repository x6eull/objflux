import { PureComponent, ReactNode } from 'react';
import { Input } from '../Input/Input';
import { Parameter, Tool, InputType, ObjectType } from '../service/type';
import { StringRecord, Timer, switchString } from '../utils/utils';
import './AutoTool.scss';
import ErrorBoundary from '../utils/ErrorBoundary';

function getDefaultValue(type: InputType) {
  if (type.keyword === 'optional')
    type = type.base;
  return type.default ?? switchString<any>(type.keyword, {
    string: '',
    number: 0,
    object() {
      const v: StringRecord = {};
      const otype = type as ObjectType;
      for (const [mn, mt] of Object.entries(otype.members))
        if ('default' in mt)
          v[mn] = mt.default;
        else
          v[mn] = getDefaultValue(mt);
      return v;
    }
  }, undefined);
}


type CalcFunc = (...values: any[]) => ReactNode;
/**由指定信息自动生成工具的输入UI，并在输入更新时自动调用`func`计算输出。
 * 要修改任何信息必须修改`props`中`tool`的指针。 */
export class AutoTool extends PureComponent<{ tool: Tool }, { values: any[], outputToRender: ReactNode }> {
  constructor(props: { tool: Tool }) {
    super(props);
    this.#rebuild();
  }
  #mounted = false;
  #clearTimers() {
    this.#timer1.clearCurrent();
    this.#timer2.clearCurrent();
  }
  componentWillUnmount() {
    this.#clearTimers();
  }
  componentDidMount() {
    this.#mounted = true;
  }
  #timer1: Timer = new Timer();
  #timer2: Timer = new Timer();
  #preTool: Tool = undefined as any;
  /**由输入改变触发的重新计算。 */
  #iCalc() {
    const { calcDelay } = this.props.tool.config;
    if (calcDelay)
      this.#timer2.timeout(() => this.#calc(), calcDelay, false);
    else this.#calc();
  }
  /**请求立即重新计算，考虑纯函数优化。 */
  #calc: () => ReactNode | Promise<ReactNode> = undefined as any;
  #rebuild() {
    this.#preTool = this.props.tool;
    this.#clearTimers();
    const { input, func, output, config } = this.props.tool;
    let o = output;
    let f: CalcFunc;
    switch (o.keyword) {
      case 'optional':
        //TODO 处理可选输出
        o = o.base;
      // falls through
      case 'react.element':
        f = (...values: any[]) => func(...values);
        break;
      default:
        throw new Error('暂不支持此输出类型');
    }
    //纯函数优化，仅跳过计算，可能不跳过重绘
    if (config.pure) {
      let preValues: any[] = [];
      let preOutput: ReactNode = undefined;
      const _f = f;
      f = (...values: any[]) => {
        if (values.length !== preValues.length || values.some((v, i) => v !== preValues[i])) {
          preValues = values;
          preOutput = _f(...values);
          return preOutput;
        }
        return preOutput;
      };
    }
    //添加检测是否挂载封装
    this.#calc = () => {
      const setOtr = (otr: ReactNode) => {
        if (this.#mounted)
          this.setState({ outputToRender: otr });
        else this.state = { ...this.state, outputToRender: otr };
        return otr;
      };
      const setError = (err: any) => {
        console.error('计算函数出错', err);
        return setOtr(<>计算函数出错: {err?.message ?? '无错误信息'}</>);
      };
      try {
        const outputToRender = f(...this.state.values);
        if (outputToRender instanceof Promise)
          return outputToRender.then(setOtr).catch(setError);
        return setOtr(outputToRender);
      } catch (err) {
        return setError(err);
      }
    };
    if (config.calcInterval) {
      this.#timer1.interval(() => { this.#calc() }, config.calcInterval, false);
    }
    const defV = input.map(ip => getDefaultValue(ip.type));
    this.state = { values: defV, outputToRender: <>正在计算初始状态</> };
    this.#calc();
  }
  render(): ReactNode {
    if (this.props.tool !== this.#preTool)
      this.#rebuild();
    const { input } = this.props.tool;
    const vs = this.state.values;
    return (<ErrorBoundary>
      <div className='autotool'>
        <div className='form'>
          {input.map((p, i) => <AutoPara onChange={(nV) => {
            vs[i] = nV;
            this.setState({ values: [...vs] });
            this.#iCalc();
          }} value={vs[i]} key={p.devName ?? p.displayName} para={p} />)}
        </div>
        <div className='result'>
          {this.state.outputToRender}
        </div>
      </div>
    </ErrorBoundary>);
  }
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