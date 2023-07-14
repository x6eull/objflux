import { createSystem, createVirtualTypeScriptEnvironment } from '@typescript/vfs';
import ts, { ScriptTarget } from 'typescript';

(window as any).parse = (code: string) => {

  const fsMap = new Map<string, string>();

  const system = createSystem(fsMap);
  const env = createVirtualTypeScriptEnvironment(system, [], ts, { target: ScriptTarget.ES2022, noLib: true, noEmitHelpers: true, noEmit: true });
  console.log(env);
  env.createFile('user.ts', code ?? 'class A{}');
  return env.languageService;
};