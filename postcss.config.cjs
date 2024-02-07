/** @type {import('postcss-load-config').ConfigFn} */
const config = ({ env }) => ({
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    cssnano: env === 'production' ? {} : false,
  },
});

module.exports = config;