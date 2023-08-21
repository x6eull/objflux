import { createSystem, createVirtualTypeScriptEnvironment } from '@typescript/vfs';
import ts from 'typescript';

import OfLib from './of.lib.d.ts?raw';
import { ObjectType, InputType, Parameter, toOptional } from './type';
import { StringRecord } from '../utils/utils';

/**撤销ts将"\等进行转义 */
function parseEscapedText(eText: string) { return JSON.parse(`"${eText}"`) }

export function parseParameter(node: ts.ParameterDeclaration, index = -1): Parameter {
  let devName: string;
  if (ts.isIdentifier(node.name))
    devName = node.name.getText();
  else if (ts.isObjectBindingPattern(node.name))
    devName = `__objectPara${index}`;
  else throw new Error(`无法解析参数${index}`);
  if (!node.type) throw new Error(`未找到${devName || ' 未知参数 '}的类型参数`);
  if (node.dotDotDotToken) throw new Error(`无法解析剩余参数${devName}`);
  const type = parseType(node.type, !!node.questionToken);
  return { devName, displayName: devName, type };
}

export function parseType(node: ts.TypeNode, optional = false): InputType {
  let result: InputType;
  switch (node.kind) {
    case ts.SyntaxKind.StringKeyword:
      result = { keyword: 'string' };
      break;
    case ts.SyntaxKind.NumberKeyword:
      result = { keyword: 'number' };
      break;
    case ts.SyntaxKind.BooleanKeyword:
      result = { keyword: 'boolean' };
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
  const members: { [name: string]: InputType } = {};
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
  return { keyword: 'object', members };
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
        let value: string | number | boolean | bigint;
        if (ts.isStringLiteral(lt))
          value = parseEscapedText(lt.text);
        else if (ts.isNumericLiteral(lt))
          value = Number(lt.text);
        else if (lt.kind === ts.SyntaxKind.TrueKeyword)
          value = true;
        else if (lt.kind === ts.SyntaxKind.FalseKeyword)
          value = false;
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

export function parseCode(code: string) {
  const fsMap = new Map<string, string>();
  fsMap.set('of.lib.d.ts', OfLib);
  const system = createSystem(fsMap);
  let exportName: string | undefined;
  const exportParameters: Parameter[] = [];
  const env = createVirtualTypeScriptEnvironment(system, [], ts, { target: ts.ScriptTarget.ES2022, noLib: true, noEmitHelpers: true, noEmit: false },
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