/* eslint-disable @typescript-eslint/no-empty-interface */
import { RecordNever, StringRecord } from '../utils/utils';


/**表示可以追踪至用户的信息，未来可能加入uid等属性。 */
export interface User {
  username: string;
}

export interface Tool {
  name: string;
  input: Parameter[];
  func: (...args: any[]) => any | Promise<any>;
  output: InputType | OutputType;
  config: ToolConfig;
}

export interface ToolConfig {
  /**指定是否为纯函数，即对于同样的输入永远给出同样的输出。 
   * 对于纯函数，输入未发生改变时会跳过计算。*/
  pure?: boolean;
  /**在输入保持不变指定时间后再计算。 */
  calcDelay?: number;
  /**每间隔一段时间计算。 */
  calcInterval?: number;
}

export interface Parameter {
  /**源代码中参数名称，如直接解构则无 */
  devName?: string;
  /**UI中参数名称 */
  displayName: string;

  type: InputType;
}

export type InputType = SimpleArrayType | OptionalType | ObjectType | StringType | NumberType | BooleanType;
export type OutputType = ReactElementType;
interface TypeBase<K extends string = string, R extends StringRecord = StringRecord> {
  keyword: K;
  restriction?: R;
  default?: NonNullable<unknown>;
}

export interface SimpleArrayType<T extends InputType = InputType> extends TypeBase<'array'> {
  base: T;
}
/**可选类型，包装另一个类型，注意`restriction`等属性仍需在`base`中获取。 */
export interface OptionalType<T extends InputType = InputType> extends TypeBase<'optional'> {
  base: T;
}
/**将类型转换为其可选变体，如果类型已经可选则throw。 */
export function toOptional<T extends InputType>(type: T): OptionalType<T> {
  if (type.keyword === 'optional')
    throw new Error('无法重复设置类型的可选性');
  return { keyword: 'optional', base: type };
}

export interface ObjectType extends TypeBase<'object', RecordNever> {
  members: StringRecord<InputType>;
}
export interface StringType extends TypeBase<'string', StringRestriction> { }
export interface NumberType extends TypeBase<'number', NumberRestriction> { }
export interface BooleanType extends TypeBase<'boolean', RecordNever> { }

export interface ReactElementType extends TypeBase<'react.element', RecordNever> { }