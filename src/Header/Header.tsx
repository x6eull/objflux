import { Link, LinkProps } from 'react-router-dom';
import './Header.scss';
import { DocsUrl } from '../main';

export function Header() {
  return (
    <header className='header'>
      <nav className='nav'>
        <Link className='logo' to='/'>objflux</Link>
        <div className='sectors'>
          <SectorLink title='探索' to='/explore' />
          <SectorLink title='库' to='/lib' />
          <SectorLink title='工具' to='/tools' />
          <SectorLink title='文档' reloadDocument={true} to={DocsUrl} />
        </div>
      </nav>
    </header>
  );
}

function SectorLink(p: { title: string } & LinkProps & React.RefAttributes<HTMLAnchorElement>) {
  const { title, ...r } = p;
  return (<Link className='sector-link' {...r}>{title}</Link>);
}