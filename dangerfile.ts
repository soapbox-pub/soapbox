import { Gitlab } from '@gitbeaker/node';
import { danger, warn, message } from 'danger';

const docs = danger.git.fileMatch('docs/**/*.md');
const app = danger.git.fileMatch('app/**/*.(js|ts|tsx)');
const tests = danger.git.fileMatch('*/__tests__/*');

if (docs.edited) {
  message('Thanks - We :heart: our [documentarians](http://www.writethedocs.org/)!');
}

if (app.modified && !tests.modified) {
  warn('You have app changes without tests.');
}

if (danger.gitlab.metadata.repoSlug === 'soapbox-pub/soapbox-fe') {
  const {
    CI_PROJECT_ID,
    CI_MERGE_REQUEST_IID,
    DANGER_GITLAB_API_TOKEN,
  } = process.env;

  const maintainers = {
    alexgleason: 737172,
    mkljczk: 1864889,
    maliboomboom: 867411,
  };

  const gitlab = new Gitlab({
    token: DANGER_GITLAB_API_TOKEN,
  });

  const assignReviewers = (ids: number[]) => {
    if (DANGER_GITLAB_API_TOKEN && CI_PROJECT_ID && CI_MERGE_REQUEST_IID) {
      gitlab.MergeRequests.edit(CI_PROJECT_ID, Number(CI_MERGE_REQUEST_IID), { reviewer_ids: ids });
    }
  };

  switch (danger.gitlab.mr.author.username) {
    case 'alexgleason':
      assignReviewers([maintainers.maliboomboom]);
      break;
    case 'mkljczk':
      assignReviewers([maintainers.alexgleason]);
      break;
    case 'maliboomboom':
      assignReviewers([maintainers.alexgleason]);
      break;
    default:
      assignReviewers([maintainers.mkljczk]);
  }
}
