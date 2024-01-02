import { PureComponent, ReactNode } from 'react';
import { Input } from '../Input/Input';
import { Parameter, Tool, InputType, ObjectType, Func } from '../core/type';
import { StringRecord, Timer, makeAsync } from '../utils/utils';
import './AutoTool.scss';
import ErrorBoundary from '../utils/ErrorBoundary';
import { ComputeError, InitError, OfTypeError } from '../utils/CustomError';

function getDefaultValue(type: InputType) {
  if (type.keyword === 'optional')
    type = type.base;
  if (typeof type.default !== 'undefined')
    return type.default;
  switch (type.keyword) {
    case 'string': return '';
    case 'number': return 0;
    case 'object': {
      const v: StringRecord = {};
      const otype = type as ObjectType;
      for (const [mn, mt] of Object.entries(otype.members))
        v[mn] = getDefaultValue(mt);
      return v;
    }
  }
  throw new OfTypeError(`无法提供${type.keyword}的默认值`);
}


type CalcFunc = (...values: any[]) => Promise<ReactNode>;
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
    this.#mounted = false;
    this.#clearTimers();
  }
  componentDidMount() {
    this.#mounted = true;
  }
  #timer1: Timer = new Timer();
  #timer2: Timer = new Timer();
  #preTool: Tool = undefined as any;
  /**由输入改变触发的重新计算。 */
  #inputCalc() {
    const toCalc = () => {
      if (this.#calculating) {
        this.#requestNewCalc++;
        console.warn(`${this.#requestNewCalc} request(s) new calc during calculating`);
      }
      else this.#calc();
    };
    const { calcDelay } = this.props.tool.config;
    if (calcDelay)
      this.#timer2.timeout(toCalc, calcDelay, false);
    else toCalc();
  }
  #calculating = false;
  #requestNewCalc = 0;
  /**请求立即重新计算，考虑纯函数优化。 */
  #calc: () => ReactNode | Promise<ReactNode> = undefined as any;
  #rebuild() {
    this.#preTool = this.props.tool;
    this.#clearTimers();
    const tool = this.props.tool;
    const { init, input, func: initialFunc, output, config } = tool;
    let o = output;
    let computeFunc: Func;//先跑init，init同步/异步返回时改为指向tool.func
    let rerenderFunc: CalcFunc;
    const setComputeFunc = (func: Func) => computeFunc = makeAsync(func,
      () => this.#calculating = true,
      () => {
        this.#calculating = false;
        if (this.#requestNewCalc) {
          this.#requestNewCalc = 0;
          this.#calc();
        }
      });
    if (init) {
      const initRet = init.call(this.props.tool);
      if (initRet instanceof Promise) {
        setComputeFunc(async (...values: any[]) => {
          await initRet;
          if (typeof tool.func !== 'function')
            throw new ComputeError('Tool lacks func after initing (async, temp computeFunc)');
          return await tool.func(...values);
        });
        initRet.then(() => {
          if (typeof tool.func !== 'function')
            throw new ComputeError('Tool lacks func after initing (async, promise callback)');
          setComputeFunc(tool.func);
        });
      }
      else {
        if (typeof tool.func !== 'function')
          throw new InitError('Tool lacks func after initing (sync)');
        else setComputeFunc(tool.func);
      }
    } else {
      if (typeof initialFunc !== 'function')
        throw new InitError('Tool lacks both init and func');
      else setComputeFunc(initialFunc);
    }
    switch (o.keyword) {
      case 'optional':
        //TODO 处理可选输出
        o = o.base;
      // falls through
      case 'react.element':
        rerenderFunc = async (...values: any[]) => await computeFunc(...values);
        break;
      default:
        throw new OfTypeError('暂不支持此输出类型');
    }
    //纯函数优化，仅跳过计算，可能不跳过重绘
    if (config.pure) {
      let preValues: any[] = [];
      let preOutput: ReactNode = undefined;
      const baseRerender = rerenderFunc;
      rerenderFunc = async (...values: any[]) => {
        if (values.length !== preValues.length || values.some((v, i) => !Object.is(v, preValues[i]))) {
          preValues = values;
          preOutput = await baseRerender(...values);
          return preOutput;
        }
        return preOutput;
      };
    }
    //检测是否挂载
    this.#calc = () => {
      const setOutputToRender = (outputNode: ReactNode) => {
        if (this.#mounted)
          this.setState({ outputToRender: outputNode });
        else this.state = { ...this.state, outputToRender: outputNode };
        return outputNode;
      };
      const setError = (err?: any) => {
        console.error('计算函数出错', err);
        return setOutputToRender(<>计算函数出错: {err?.message ?? '未知错误'}</>);
      };
      try {
        const outputToRender = rerenderFunc(...this.state.values);
        if (outputToRender instanceof Promise)
          return outputToRender.then(setOutputToRender).catch(setError);
        else
          return setOutputToRender(outputToRender);
      } catch (errCaught) {
        return setError(errCaught);
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
      <div className={'autotool' + (this.props.tool.layout === 'horizontal' ? ' horizontal' : '')}>
        <div className='form'>
          {input.map((p, i) => <AutoPara onChange={(nV) => {
            vs[i] = nV;
            this.setState({ values: [...vs] });
            this.#inputCalc();
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
      let ml = false, vl = 0;
      const rMl = type.restriction?.multiLine;
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
          throw new OfTypeError('无效的multiLine约束');
      }
      return (<Input seperateTitleWithInput={type.restriction?.seperatedInput} maxLength={type.restriction?.maxLength} allowMultiline={ml as any} viewLines={vl as any} onChange={onChange} value={String(value)} title={displayName} required={required} />);
    }
    default:
      throw new OfTypeError('暂不支持此输入类型');
  }
}