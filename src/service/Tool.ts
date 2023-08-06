/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StringRecord } from '../utils/utils';
import { createSystem, createVirtualTypeScriptEnvironment } from '@typescript/vfs';
import ts, { ScriptTarget } from 'typescript';

import OfLib from './of.lib.d.ts?raw';

/**表示可以追踪至用户的信息，未来可能加入uid等属性。 */
export interface User {
  username: string;
}
export interface Tool {
  name: string;
  input: Parameter[];
  func: (...args: any[]) => any;
  output: TypeBase | OutputType;
}

export interface Parameter {
  /**源代码中参数名称，如直接解构则无 */
  devName?: string;
  /**UI中参数名称 */
  displayName: string;

  type: ValidInputType;
}

export type ValidInputType = SimpleArrayType | OptionalType | ObjectType | StringType | NumberType | BooleanType;

interface TypeBase<K extends string = string, R extends StringRecord = StringRecord> {
  keyword: K;
  restriction: R;
}

export interface SimpleArrayType<T extends ValidInputType = ValidInputType> extends TypeBase<'array'> {
  base: T;
}
/**可选类型，包装另一个类型，注意`restriction`等属性仍需在`base`中获取。 */
export interface OptionalType<T extends ValidInputType = ValidInputType> extends TypeBase<'optional'> {
  base: T;
}
/**将类型转换为其可选变体，如果类型已经可选则throw。 */
function toOptional<T extends ValidInputType>(type: T): OptionalType<T> {
  if (type.keyword === 'optional')
    throw new Error('无法重复设置类型的可选性');
  return { keyword: 'optional', base: type, restriction: {} };
}

export interface ObjectType extends TypeBase<'object', StringRecord<never>> {
  members: StringRecord<ValidInputType>;
}
export interface StringType extends TypeBase<'string', StringRestriction> { }
export interface NumberType extends TypeBase<'number', NumberRestriction> { }
export interface BooleanType extends TypeBase<'boolean', StringRecord<never>> { }

export interface OutputType<K extends string = string> {
  outKeyword: K;
}

export interface ReactElementOuput extends OutputType<'ui.react.element'> { }

/**撤销ts将"\等进行转义 */
function parseEscapedText(eText: string) { return JSON.parse(`"${eText}"`) }

export function parseParameter(node: ts.ParameterDeclaration, index?: number): Parameter {
  let devName: string;
  if (ts.isIdentifier(node.name))
    devName = node.name.getText();
  else if (ts.isObjectBindingPattern(node.name))
    devName = `__objectPara${index ?? ''}`;
  else throw new Error(`无法解析参数${index ?? ''}`);
  if (!node.type) throw new Error(`未找到${devName}的类型参数`);
  if (node.dotDotDotToken) throw new Error(`无法解析剩余参数${devName}`);
  const type = parseType(node.type, !!node.questionToken);
  return { devName, displayName: devName, type };
}

export function parseType(node: ts.TypeNode, optional = false): ValidInputType {
  let result: ValidInputType;
  switch (node.kind) {
    case ts.SyntaxKind.StringKeyword:
      result = { keyword: 'string', restriction: {} };
      break;
    case ts.SyntaxKind.NumberKeyword:
      result = { keyword: 'number', restriction: {} };
      break;
    case ts.SyntaxKind.BooleanKeyword:
      result = { keyword: 'boolean', restriction: {} };
      break;
    case ts.SyntaxKind.TypeReference: {
      const n = node as ts.TypeReferenceNode;
      const ta = n.typeArguments?.[0];
      let restriction = {} as StringRecord;
      if (!ta)
        throw new Error('无法解析约束:类型参数数量无效');
      else {
        if (ts.isTypeLiteralNode(ta)) {
          //考虑：转换;'后使用JSON.parse?
          restriction = parseTypeLiteralAsRestriction(ta);
        }
        else throw new Error('无法解析约束:无法解析指定类型参数');
      }
      const trefName = n.typeName.getText();
      let kw: 'string' | 'number';
      switch (trefName) {
        case 'OfString':
          kw = 'string';
          break;
        case 'OfNumber':
          kw = 'number';
          break;
        default:
          throw new Error(`暂不支持此类型:${trefName}`);
      }
      result = { keyword: kw, restriction };
      break;
    }
    case ts.SyntaxKind.TypeLiteral:
      result = parseTypeLiteralAsObjectType(node as ts.TypeLiteralNode);
      break;
    default:
      throw new Error(`无法解析的类型:${node.getText()}`);
  }
  if (optional)
    return toOptional(result);
  return result;
}

export function parseTypeLiteralAsObjectType(node: ts.TypeLiteralNode): ObjectType {
  const members: { [name: string]: ValidInputType } = {};
  node.members.forEach((m, i) => {
    if (ts.isPropertySignature(m)) {
      let mtext: string;
      if ('text' in m.name)
        mtext = parseEscapedText(m.name.text);
      else
        mtext = m.name.getText();
      if (!m.type) throw new Error(`成员${i}(${mtext})无效`);
      members[mtext] = parseType(m.type, !!m.questionToken);
    } else throw new Error(`成员${i}无效`);
  });
  return { keyword: 'object', members, restriction: {} };
}

export function parseTypeLiteralAsRestriction(node: ts.TypeLiteralNode): StringRecord {
  const result: StringRecord = {};
  node.members.forEach(m => {
    if (ts.isPropertySignature(m)) {
      const mtype = m.type;
      if (!mtype)
        throw new Error('无法解析约束:指定属性缺少类型');
      //TODO 支持类型引用?
      if (ts.isLiteralTypeNode(mtype)) {
        const lt = mtype.literal;
        let value;
        if (ts.isStringLiteral(lt))
          value = parseEscapedText(lt.text);
        else if (ts.isNumericLiteral(lt))
          value = Number(lt.text);
        else if (ts.isBigIntLiteral(lt)) {
          const biText = lt.text;
          //去除末尾n
          value = BigInt(biText.substring(0, biText.length - 1));
        }
        else throw new Error('无法解析约束:指定属性类型无效');
        result[(m.name as ts.Identifier).getText()] = value;
      }
      else if (ts.isTypeLiteralNode(mtype)) {
        result[(m.name as ts.Identifier).getText()] = parseTypeLiteralAsRestriction(mtype);
      }
      else throw new Error('无法解析约束:指定属性字面量无效');
    }
    else throw new Error('无法解析约束:指定类型参数中包含无效成员');
  });
  return result;
}

export async function parseCode(code: string) {
  const fsMap = new Map<string, string>();
  fsMap.set('of.lib.d.ts', OfLib);
  const system = createSystem(fsMap);
  let exportName: string | undefined;
  const exportParameters: Parameter[] = [];
  const env = createVirtualTypeScriptEnvironment(system, [], ts, { target: ScriptTarget.ES2022, noLib: true, noEmitHelpers: true, noEmit: false },
    {
      before: [(context) => (sf1) => <ts.SourceFile>ts.visitNode(sf1, sf => {
        return ts.visitEachChild(sf, (child) => {
          if (ts.isFunctionDeclaration(child)) {
            //如存在export关键字则解析
            //考虑：如仅存在一个函数声明则自动给其添加export
            if (child.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
              if (exportName)
                throw new Error('存在多个导出函数');
              exportName = child.name?.getText();
              child.parameters.forEach((p, i) => {
                const para = parseParameter(p, i);
                exportParameters.push(para);
              });

            }
          }
          return child;
        }, context);
      })]
    }
  );
  env.createFile('user.ts', code);
  const emitedText = env.languageService.getEmitOutput('user.ts').outputFiles[0].text;
  if (!exportName)
    throw new Error('缺少导出函数');
  return { emitedText, exportName, para: exportParameters };
}