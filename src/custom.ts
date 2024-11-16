/**
 * Functions for dealing with custom build configuration.
 */
import * as BuildConfig from 'soapbox/build-config.ts';

/** Require a custom JSON file if it exists */
export const custom = (filename: string, fallback: any = {}): any => {
  if (BuildConfig.NODE_ENV === 'test') return fallback;

  const modules = import.meta.glob('../custom/*.json', { eager: true });
  const key = `../../custom/${filename}.json`;

  return modules[key] ? modules[key] : fallback;
};
