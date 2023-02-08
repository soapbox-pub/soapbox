import '../app/styles/tailwind.css';
import '../stories/theme.css';

import { addDecorator, Story } from '@storybook/react';
import { IntlProvider } from 'react-intl';
import React from 'react';

const withProvider = (Story: Story) => (
  <IntlProvider locale='en'><Story /></IntlProvider>
);

addDecorator(withProvider);

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
