import { StringType } from '../../service/type';
import { Register } from '../loader';
import { Markdown } from './Markdown';
import { Playground } from './Playground';

export const register: Register = {
  user: { username: 'of' },
  tools: [
    {
      name: 'playground',
      input: [{
        displayName: '源代码',
        type: { keyword: 'string', restriction: { multiLine: 8 }, default: 'export function myFunc(x:string,y:string){return `${x.length} ${y}`;}' } as StringType,
      }],
      func: (source: string) => <Playground source={source} />,
      output: { keyword: 'react.element' },
      config: { calcDelay: 300, pure: true }
    }, {
      name: 'markdown',
      layout: 'horizontal',
      input: [{
        displayName: 'Markdown源代码',
        type: {
          keyword: 'string',
          restriction: {
            multiLine: 16,
            seperatedInput: true
          },
          default: `# 支持的语法
1~6个\\# => h1~h6

\\*斜体\\* => *斜体*

\\*\\*粗体\\*\\* => **粗体**

\\*\\*\\*粗体斜体\\*\\*\\* => ***粗体斜体***
### 也支持*一部分的嵌套*\`code\`[to Github](https://github.com)
[to Github](https://github.com)
`
        }
      }],
      func: (source: string) => <Markdown source={source} />,
      output: { keyword: 'react.element' },
      config: { calcDelay: 100, pure: true }
    }
  ]
};