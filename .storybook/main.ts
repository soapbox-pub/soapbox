import sharedConfig from '../webpack/shared';

import type { StorybookConfig } from '@storybook/core-common';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-react-intl',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  webpackFinal: async (config) => {
    config.resolve!.alias = {
      ...sharedConfig.resolve!.alias,
      ...config.resolve!.alias,
    };

    config.resolve!.modules = [
      ...sharedConfig.resolve!.modules!,
      ...config.resolve!.modules!,
    ];

    return config;
  },
};

export default config;