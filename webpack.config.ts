import dotenv from 'dotenv';

import type { Configuration } from 'webpack';

dotenv.config();

const { NODE_ENV } = process.env;

let configuration: Configuration = {};

switch (NODE_ENV) {
  case 'development':
  case 'production':
  case 'test':
    configuration = require(`./webpack/${NODE_ENV}`).default;
    break;
  default:
    console.error('ERROR: NODE_ENV must be set to either `development`, `test`, or `production`.');
    process.exit(1);
}

export default configuration;