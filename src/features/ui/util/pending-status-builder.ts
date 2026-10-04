import { normalizeStatus } from '@/normalizers/status.ts';
import { calculateStatus } from '@/reducers/statuses.ts';
import { makeGetAccount } from '@/selectors/index.ts';

import type { PendingStatus } from '@/reducers/pending-statuses.ts';
import type { RootState } from '@/store.ts';

const getAccount = makeGetAccount();

const buildMentions = (pendingStatus: PendingStatus) => {
  if (pendingStatus.in_reply_to_id) {
    return (pendingStatus.to || []).map(acct => ({ acct }));
  } else {
    return [];
  }
};

const buildPoll = (pendingStatus: PendingStatus) => {
  if (pendingStatus.poll?.options) {
    return {
      ...pendingStatus.poll,
      options: pendingStatus.poll.options.map((title: string) => ({ title })),
    };
  } else {
    return null;
  }
};

export const buildStatus = (state: RootState, pendingStatus: PendingStatus, idempotencyKey: string) => {
  const me = state.me as string;
  const account = getAccount(state, me);
  const inReplyToId = pendingStatus.in_reply_to_id;

  const status = {
    account,
    content: pendingStatus.status.replace(new RegExp('\n', 'g'), '<br>'), /* eslint-disable-line no-control-regex */
    id: `末pending-${idempotencyKey}`,
    in_reply_to_account_id: inReplyToId ? state.statuses[inReplyToId]?.account?.id ?? null : null,
    in_reply_to_id: inReplyToId,
    media_attachments: (pendingStatus.media_ids || []).map((id: string) => ({ id })),
    mentions: buildMentions(pendingStatus),
    poll: buildPoll(pendingStatus),
    quote: pendingStatus.quote_id,
    sensitive: pendingStatus.sensitive,
    visibility: pendingStatus.visibility,
  };

  return calculateStatus(normalizeStatus(status));
};
