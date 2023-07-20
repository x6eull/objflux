/* eslint-disable @typescript-eslint/no-unused-vars */
import { StringRecord } from '../utils/utils';
import { createSystem, createVirtualTypeScriptEnvironment } from '@typescript/vfs';
import ts, { ScriptTarget } from 'typescript';

import OfLib from './of.lib.d.ts?raw';

export interface Tool {
  name: string;
  input: Parameter[];
  output: Type;
}

export interface Parameter {
  /**源代码中参数名称，如直接解构则无 */
  devName?: string;
  /**UI中参数名称 */
  displayName: string;

  type: Type;
}

export interface Type {
  expression: string;
  optional?: boolean;
}

interface SimpleArrayType extends Type { element: Type; }
interface OptionalType<T extends Type> extends Type {
  expression: `${T['expression']}?`;
  optional: true;
}
/**将类型转换为其可选变体，如果类型已经可选则throw。 */
function toOptional<T extends Type>(type: T): OptionalType<T> {
  if (type.optional)
    throw new Error('无法重复设置类型的可选性');
  return { ...type, optional: true, expression: type.expression + '?' } as OptionalType<T>;
}

interface StringType extends Type, StringRestriction { expression: 'string'; }
interface NumberType extends Type, NumberRestriction { expression: 'number'; }
interface BooleanType extends Type { expression: 'boolean' }

export function parseParameter(node: ts.ParameterDeclaration): Parameter {
  if (node.name.kind !== ts.SyntaxKind.Identifier)
    throw new Error('无法解析参数名');
  const devName = node.name.getFullText();
  if (!node.type) throw new Error(`未找到${devName}的类型参数`);
  if (node.dotDotDotToken) throw new Error(`无法解析剩余参数${devName}`);
  const type = parseType(node.type, !!node.questionToken);
  return { devName, displayName: devName, type };
}

export function parseType(node: ts.TypeNode, optional: boolean): Type {
  function parseKeyword(node: ts.TypeNode): Type {
    switch (node.kind) {
      case ts.SyntaxKind.StringKeyword:
        return { expression: 'string' };
      case ts.SyntaxKind.NumberKeyword:
        return { expression: 'number' };
      case ts.SyntaxKind.BooleanKeyword:
        return { expression: 'boolean' };
      case ts.SyntaxKind.TypeReference: {
        const n = node as ts.TypeReferenceNode;
        const ta = n.typeArguments?.[0];
        const restriction = {} as StringRecord;
        if (!ta)
          throw new Error('无法解析约束:类型参数数量无效');
        else {
          if (ts.isTypeLiteralNode(ta)) {
            ta.members.forEach(m => {
              if (ts.isPropertySignature(m)) {
                const mtype = m.type;
                if (!mtype)
                  throw new Error('无法解析约束:指定属性缺少类型');
                //TODO 支持类型引用？
                if (ts.isLiteralTypeNode(mtype)) {
                  const lt = mtype.literal;
                  let value;
                  if (ts.isStringLiteral(lt))
                    value = lt.getFullText();
                  else if (ts.isNumericLiteral(lt))
                    value = Number(lt.getFullText());
                  //TODO 支持BigIntLiteral?
                  else throw new Error('无法解析约束:指定属性缺少类型');
                  restriction[(m.name as ts.Identifier).getFullText()] = value;
                }
                else throw new Error('无法解析约束:指定属性字面量无效');
              }
              else throw new Error('无法解析约束:指定类型参数中包含无效成员');
            });
          }
          else throw new Error('无法解析约束:无法解析指定类型参数');

        }
        let result: Type;
        const trefName = n.typeName.getFullText();
        switch (trefName) {
          case 'OfString':
            result = { expression: 'string' };
            break;
          case 'OfNumber':
            result = { expression: 'number' };
            break;
          default:
            throw new Error(`'4暂不支持此类型:${trefName}`);
        }
        return Object.assign(restriction, result);
      }
    }
    throw new Error(`无法解析的类型:${node.getFullText()}`);
  }
  const t = parseKeyword(node);
  if (optional)
    return toOptional(t);
  return t;
}

export async function parse(code: string) {
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
              child.parameters.forEach(p => {
                const para = parseParameter(p);
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
  const url = `data:application/javascript,${encodeURIComponent(emitedText)}`;
  const module = await import(/* @vite-ignore */url);
  return { out: emitedText, exportName, para: exportParameters, module, func: module[exportName] };
}

//DEBUG only
(window as any).parse = parse;