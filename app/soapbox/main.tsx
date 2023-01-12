import * as OfflinePluginRuntime from '@lcdp/offline-plugin/runtime';
import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { createRoot } from 'react-dom/client';

import * as BuildConfig from 'soapbox/build-config';
import { printConsoleWarning } from 'soapbox/utils/console';

import '../soapbox/iframe';
import '../styles/application.scss';

import './precheck';
import { default as Soapbox } from './containers/soapbox';
import * as monitoring from './monitoring';
import * as perf from './performance';
import ready from './ready';

perf.start('main()');

// Sentry
monitoring.start();

// Print console warning
if (BuildConfig.NODE_ENV === 'production') {
  printConsoleWarning();
}

ready(() => {
  const container = document.getElementById('soapbox') as HTMLElement;
  const root = createRoot(container);

  root.render(<Soapbox />);

  if (BuildConfig.NODE_ENV === 'production') {
    // avoid offline in dev mode because it's harder to debug
    // https://github.com/NekR/offline-plugin/pull/201#issuecomment-285133572
    OfflinePluginRuntime.install();
  }
  perf.stop('main()');
});