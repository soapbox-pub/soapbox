import fs from 'fs';
import { join } from 'path';

/** Parse the changelog into an object. */
function parseChangelog(changelog: string): Record<string, string> {
  const result: Record<string, string> = {};

  let currentVersion: string;
  changelog.split('\n').forEach(line => {
    const match = line.match(/^## \[([\d.]+)\](?: - [\d-]+)?$/);
    if (match) {
      currentVersion = match[1];
    } else if (currentVersion) {
      result[currentVersion] = (result[currentVersion] || '') + line + '\n';
    }
  });

  return result;
}

/** Get Markdown changes for a specific version. */
function getChanges(version: string) {
  version = version.replace('v', '');
  const content = fs.readFileSync(join(__dirname, '..', '..', 'CHANGELOG.md'), 'utf8');
  const parsed = parseChangelog(content);
  return (parsed[version] || '').trim();
}

export {
  parseChangelog,
  getChanges,
};