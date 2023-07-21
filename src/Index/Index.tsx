import { Folder } from '../Folder/Folder';
import { OptionGroup } from '../OptionGroup/OptionGroup';
import { Checkbox } from '../Checkbox/Checkbox';

import '../tool/Tool';
import { Input } from '../Input/Input';
import { useState } from 'react';

export function IndexElement() {
  const [stringValue, setStringValue] = useState<string>('a');

  return (<><Folder title='可见性' desc='修改可见性不会更改工具的链接' >
    <OptionGroup options={[{ title: '公开', desc: '任何人都可使用此工具' }, { title: '仅链接', desc: '此工具不显示在探索页或您的公开工具中，但通过链接仍可使用，用户也可以收藏' }, { title: '私有', desc: '仅您可使用此工具' }]} /></Folder><Folder title='复刻权限' >
      <OptionGroup options={[{ title: '所有人', desc: '所有登录用户均可复刻此工具' }, { title: '需要申请', desc: '用户可以申请复刻此工具' }, { title: '仅自己' }]} /><Checkbox title='保留复刻来源' desc='其他用户复刻此工具后，复刻的工具将默认显示复刻来源'></Checkbox></Folder>
    <Folder> <Folder> <Folder> <Folder><OptionGroup options={['x1', 'x2']} /></Folder></Folder> </Folder> </Folder>
    <OptionGroup options={['x1', 'x2']} />
    <Input title='阿斯顿法国红酒快乐' value={stringValue} onChange={value => {setStringValue(value)}} />
  </>);
}