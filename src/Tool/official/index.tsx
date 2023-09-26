import { StringType } from '../../service/type';
import { notAvailable } from '../../utils/utils';
import { Register } from '../loader';

export const register: Register = {
  user: { username: 'of' },
  tools: [
    {
      name: 'playground',
      input: [{
        displayName: '源代码',
        type: { keyword: 'string', restriction: { multiLine: 8 }, default: 'export function myFunc(x:string,y:string){return `${x.length} ${y}`;}' } as StringType,
      }],
      async init() {
        const Playground = (await import('./Playground')).Playground;
        this.func = (source: string) => <Playground source={source} />;
      },
      func: notAvailable,
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
双空格或空行均可换行（实际原理有别，分别为插入br和新建p元素）  
\\*斜体\\* => *斜体*  
\\*\\*粗体\\*\\* => **粗体**  
\\*\\*\\*粗体斜体\\*\\*\\* => ***粗体斜体*** 
\`\`\`jvavscript
widow.setTimeout(() -》 {
  console.lag("无可奉告'）;
}, 100);
\`\`\`
### 也支持*一部分的嵌套* \`code\` [to Github](https://github.com)
![Image](https://markdown.com.cn/assets/img/philly-magic-garden.9c0b4415.jpg)
`
        }
      }],
      async init() {
        const Markdown = (await import('./Markdown')).Markdown;
        this.func = (source: string) => <Markdown source={source} />;
      },
      func: notAvailable,
      output: { keyword: 'react.element' },
      config: { calcDelay: 100, pure: true }
    }
  ]
};