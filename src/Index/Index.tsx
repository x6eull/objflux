import { Folder } from '../Folder/Folder';
import { Checkbox } from '../Checkbox/Checkbox';

import { Input } from '../Input/Input';

export function IndexElement() {
  return (<>
    <Folder title='测试中组件'>
      <Checkbox title='Checkbox Without Description' />
      <Input title='Input Without Description' placeholder='Form elements must have labels: Element has no title attribute Element has an empty placeholder attribute' />
      <Input title='Input With Description' seperateTitleWithInput={true} desc='Description Texts.' />
      <Input title='哎呀这不' desc='无论如何，输入框一定会给你报错' error={true} placeholder='爆！' />
      <Input allowMultiline={true} title='分离input 分离desc' desc='description' seperateTitleWithDescription={true} seperateTitleWithInput={true} placeholder='不丑吗' />
      <Input title='开始写多行了兄弟萌' desc='(๑• . •๑) 明白了w' allowMultiline={true} placeholder='马上就来啦' />
    </Folder>
  </>);
}