import { resolve } from 'path';

import type { LoaderContext } from 'webpack';

/**
 * Forces recompile whenever the current commit changes.
 * Useful for generating the version hash in the UI.
 */
function loader(this: LoaderContext<{}>, content: string) {
  this.addDependency(resolve(__dirname, '../../.git/logs/HEAD'));
  this.callback(undefined, content);
}

export default loader;