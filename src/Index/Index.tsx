import { useState } from 'react';

import { Folder } from '../Folder/Folder';
import { OptionGroup } from '../OptionGroup/OptionGroup';

export function IndexElement() {
  const [i1, setI1] = useState(0);
  const [i2, setI2] = useState(0);
  const [i3, setI3] = useState(0);
  return (<><Folder title='可见性' desc='修改可见性不会更改工具的链接' >
    <OptionGroup current={i1} onChange={setI1} options={[{ title: '公开', desc: '任何人都可使用此工具' }, { title: '仅链接', desc: '此工具不显示在探索页或您的公开工具中，但通过链接仍可使用，用户也可以收藏' }, { title: '私有', desc: '仅您可使用此工具' }]} /></Folder><Folder title='复刻权限' >
      <OptionGroup current={i2} onChange={setI2} options={[{ title: '所有人', desc: '所有登录用户均可复刻此工具' }, { title: '需要申请', desc: '用户可以申请复刻此工具' }, { title: '仅自己' }]} /></Folder>
    <Folder> <Folder> <Folder> <Folder><OptionGroup current={i3} onChange={setI3} options={['x1', 'x2']} /></Folder></Folder> </Folder> </Folder>
    <OptionGroup current={i3} onChange={setI3} options={['x1', 'x2']} />
  </>);
}