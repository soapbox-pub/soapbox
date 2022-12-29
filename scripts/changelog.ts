import fs from 'fs';
import { join } from 'path';

const version = process.argv[2].replace('v', '');

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

const changelog = fs.readFileSync(join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
const parsed = parseChangelog(changelog);

// Log to stdout so we can redirect it in CI.
// eslint-disable-next-line no-console
console.log((parsed[version] || '').trim());



