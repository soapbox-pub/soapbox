const ASSET_EXTS = 'css|styl|less|sass|scss|png|jpg|svg|ogg|oga|mp3|ttf|woff|woff2';

module.exports = {
  'testPathIgnorePatterns': [
    '<rootDir>/node_modules/',
    '<rootDir>/vendor/',
    '<rootDir>/config/',
    '<rootDir>/log/',
    '<rootDir>/static/',
    '<rootDir>/tmp/',
    '<rootDir>/webpack/',
  ],
  'setupFiles': [
    'raf/polyfill',
  ],
  'setupFilesAfterEnv': [
    '<rootDir>/app/soapbox/jest/test-setup.ts',
  ],
  'collectCoverageFrom': [
    'app/soapbox/**/*.js',
    'app/soapbox/**/*.ts',
    'app/soapbox/**/*.tsx',
    '!app/soapbox/features/emoji/emoji-compressed.js',
    '!app/soapbox/service-worker/entry.ts',
    '!app/soapbox/jest/test-setup.ts',
    '!app/soapbox/jest/test-helpers.ts',
  ],
  'coverageDirectory': '<rootDir>/.coverage/',
  'coverageReporters': ['html', 'text', 'text-summary', 'cobertura'],
  'reporters': ['default', 'jest-junit'],
  'moduleDirectories': [
    '<rootDir>/node_modules',
    '<rootDir>/app',
  ],
  'testMatch': ['**/*/__tests__/**/?(*.|*-)+(test).(ts|js)?(x)'],
  'testEnvironment': 'jsdom',
  'transformIgnorePatterns': [
    // FIXME: react-sticky-box doesn't provide a CJS build, so transform it for now
    // https://github.com/codecks-io/react-sticky-box/issues/79
    `/node_modules/(?!(react-sticky-box|blurhash|.+\\.(${ASSET_EXTS})$))`,
    // Ignore node_modules, except static assets
    // `/node_modules/(?!.+\\.(${ASSET_EXTS})$)`,
  ],
  'transform': {
    '\\.[jt]sx?$': 'babel-jest',
    [`\\.(${ASSET_EXTS})$`]: '<rootDir>/jest/assetTransformer.js',
  },
};
