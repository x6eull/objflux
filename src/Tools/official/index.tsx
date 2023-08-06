import { StringType } from '../../service/Tool';
import { Register } from '../loader';
import { Playground } from './Playground';

export const register: Register = {
  user: { username: 'of' },
  tools: [
    {
      name: 'playground',
      input: [{
        displayName: '源代码',
        type: { keyword: 'string', restriction: { multiLine: true } } as StringType
      }],
      func: (source: string) => <Playground source={source} />,
      output: { outKeyword: 'ui.react.element' }
    }
  ]
};