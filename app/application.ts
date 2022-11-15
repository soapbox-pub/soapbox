import loadPolyfills from './soapbox/load-polyfills';

// Load iframe event listener
require('./soapbox/iframe');

// @ts-ignore
require.context('./assets/images/', true);

// Load stylesheet
require('react-datepicker/dist/react-datepicker.css');
require('./styles/application.scss');

loadPolyfills().then(() => {
  require('./soapbox/main').default();
}).catch(e => {
  console.error(e);
});
