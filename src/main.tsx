import { enableMapSet } from 'immer';
import { createRoot } from 'react-dom/client';

import * as BuildConfig from 'soapbox/build-config.ts';
import Soapbox from 'soapbox/init/soapbox.tsx';
import { printConsoleWarning } from 'soapbox/utils/console.ts';

import '@fontsource/inter/200.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/900.css';
import '@fontsource/roboto-mono/400.css';
import 'line-awesome/dist/font-awesome-line-awesome/css/all.css';
import 'soapbox/features/nostr/keyring.ts';

import './iframe.ts';
import './styles/tailwind.css';

import ready from './ready.ts';
import { registerSW, lockSW } from './utils/sw.ts';

enableMapSet();

if (BuildConfig.NODE_ENV === 'production') {
  printConsoleWarning();
  registerSW('/sw.js');
  lockSW();
}

ready(() => {
  const container = document.getElementById('soapbox') as HTMLElement;
  const root = createRoot(container);

  root.render(<Soapbox />);
});