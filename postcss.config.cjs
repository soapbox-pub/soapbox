module.exports = ({ env }) => ({
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    cssnano: env === 'production' ? {} : false,
  },
});
