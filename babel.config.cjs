module.exports = (api) => {
  const env = api.env();

  const envOptions = {
    debug: false,
    modules: false,
    useBuiltIns: 'usage',
    corejs: '3.27',
  };

  const config = {
    presets: [
      '@babel/react',
      '@babel/typescript',
      ['@babel/env', envOptions],
    ],
    plugins: [
      'formatjs',
      'preval',
    ],
    'sourceType': 'unambiguous',
  };

  switch (env) {
    case 'production':
      config.plugins.push(...[
        '@babel/transform-react-inline-elements',
        [
          '@babel/transform-runtime',
          {
            helpers: true,
            regenerator: false,
            useESModules: true,
          },
        ],
      ]);
      break;
    case 'test':
      config.plugins.push(...[
        'transform-require-context',
      ]);
      envOptions.modules = 'commonjs';
      break;
  }

  return config;
};
