import ReactDOM from 'react-dom/client';
import './main.scss';
import { readConfig } from './utils/config';
import App from './App';

import './utils/utils';

export const docsUrl = '/';
export const hostname = 'objflux.com';
const hostnameGuard = /^objflux.com|localhost$/;
if (!hostnameGuard.test(location.hostname) && readConfig('disableHostnameGuard') !== '1')
  location.hostname = hostname;

if (!(/^https?:\/\/(localhost|127\.0\.0\.1)/.test(location.href)))
  throw new Error('Invalid href');
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);