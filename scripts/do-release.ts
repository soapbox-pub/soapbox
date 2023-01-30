import { Gitlab } from '@gitbeaker/node';

import { getChanges } from './lib/changelog';

const {
  CI_COMMIT_TAG,
  CI_JOB_TOKEN,
  CI_PROJECT_ID,
} = process.env;

const api = new Gitlab({
  host: 'https://gitlab.com',
  jobToken: CI_JOB_TOKEN,
});

async function main() {
  await api.Releases.create(CI_PROJECT_ID!, {
    name: CI_COMMIT_TAG,
    tag_name: CI_COMMIT_TAG,
    description: '## Changelog\n\n' + getChanges(CI_COMMIT_TAG!),
    assets: {
      links: [{
        name: 'Build',
        url: `https://gitlab.com/soapbox-pub/soapbox/-/jobs/artifacts/${CI_COMMIT_TAG}/download?job=build-production`,
        link_type: 'package',
      }],
    },
  });
}

main();