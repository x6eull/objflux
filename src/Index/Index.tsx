import { Folder } from '../Folder/Folder';
import { OptionGroup } from '../OptionGroup/OptionGroup';
import { Checkbox } from '../Checkbox/Checkbox';

import '../tool/Tool';
import { Input } from '../Input/Input';

export function IndexElement() {
  return (<><Folder title='可见性' desc='修改可见性不会更改工具的链接' >
    <OptionGroup options={[{ title: '公开', desc: '任何人都可使用此工具' }, { title: '仅链接', desc: '此工具不显示在探索页或您的公开工具中，但通过链接仍可使用，用户也可以收藏' }, { title: '私有', desc: '仅您可使用此工具' }]} /></Folder><Folder title='复刻权限' >
      <OptionGroup options={[{ title: '所有人', desc: '所有登录用户均可复刻此工具' }, { title: '需要申请', desc: '用户可以申请复刻此工具' }, { title: '仅自己' }]} /><Checkbox title='保留复刻来源' desc='其他用户复刻此工具后，复刻的工具将默认显示复刻来源'></Checkbox></Folder>
    <Folder>
      <Folder> <Folder> <Folder><OptionGroup options={['x1', 'x2']} /></Folder></Folder> </Folder>
      <Checkbox title='Checkbox Without Description' />
      <Input title='Input Without Description' placeholder='Form elements must have labels: Element has no title attribute Element has an empty placeholder attribute' />
      <Input title='Input With Description' seperateTitleWithInput={true} desc='Description Texts. 有理有理，哈吉马路油！' />
      <Input title='哎呀这不' desc='无论如何，输入框一定会给你报错' error={true} placeholder='爆！' />
      <Input allowMultiline={true} title='换行爱上对方过后就哭了什么时候开发OPAI' desc='全部换行，Passthem 欢迎回到 TopZeroUnion 今天是开服的第 6.02 × 10²³ 天' seperateTitleWithDescription={true} seperateTitleWithInput={true} placeholder='不丑吗' />
      <Input title='开始写多行了兄弟萌' desc='(๑• . •๑) 明白了w' allowMultiline={true} placeholder='马上就来啦' />
    </Folder>
    <OptionGroup options={['x1', 'x2']} />
  </>);
}