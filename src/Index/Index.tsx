import { Folder } from '../Folder/Folder';
import { Checkbox } from '../Checkbox/Checkbox';

import { Input } from '../Input/Input';

export function IndexElement() {
  return (<>
    <Folder title='测试中组件'>
      <Checkbox title='Checkbox Without Description' />
      <Input title='Input Without Description' placeholder='Form elements must have labels: Element has no title attribute Element has an empty placeholder attribute' />
      <Input title='Input With Description' seperateTitleWithInput={true} desc='Description Texts. 有理有理，哈吉马路油！' />
      <Input title='哎呀这不' desc='无论如何，输入框一定会给你报错' error={true} placeholder='爆！' />
      <Input allowMultiline={true} title='换行爱上对方过后就哭了什么时候开发OPAI' desc='全部换行，Passthem 欢迎回到 TopZeroUnion 今天是开服的第 6.02 × 10²³ 天' seperateTitleWithDescription={true} seperateTitleWithInput={true} placeholder='不丑吗' />
      <Input title='开始写多行了兄弟萌' desc='(๑• . •๑) 明白了w' allowMultiline={true} placeholder='马上就来啦' />
    </Folder>
  </>);
}