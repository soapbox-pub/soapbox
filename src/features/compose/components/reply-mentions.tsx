import React, { useCallback } from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { useAppDispatch, useAppSelector, useCompose, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { statusToMentionsAccountIdsArray } from 'soapbox/reducers/compose';
import { makeGetStatus } from 'soapbox/selectors';
import { isPubkey } from 'soapbox/utils/nostr';

import type { Status as StatusEntity } from 'soapbox/types/entities';

interface IReplyMentions {
  composeId: string
}

const ReplyMentions: React.FC<IReplyMentions> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const compose = useCompose(composeId);

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector<StatusEntity | null>(state => getStatus(state, { id: compose.in_reply_to! }));
  const to = compose.to;
  const { account } = useOwnAccount();

  if (!features.explicitAddressing || !status || !to) {
    return null;
  }

  const parentTo = status && statusToMentionsAccountIdsArray(status, account!);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    dispatch(openModal('REPLY_MENTIONS', {
      composeId,
    }));
  };

  if (!parentTo || (parentTo.size === 0)) {
    return null;
  }

  if (to.size === 0) {
    return (
      <a href='#' className='reply-mentions' onClick={handleClick}>
        <FormattedMessage
          id='reply_mentions.reply_empty'
          defaultMessage='Replying to post'
        />
      </a>
    );
  }

  const accounts = to.slice(0, 2).map((acct: string) => {
    const username = acct.split('@')[0];
    return (
      <span className='reply-mentions__account'>
        @{isPubkey(username) ? username.slice(0, 8) : username}
      </span>
    );
  }).toArray();

  if (to.size > 2) {
    accounts.push(
      <FormattedMessage id='reply_mentions.more' defaultMessage='{count} more' values={{ count: to.size - 2 }} />,
    );
  }

  return (
    <a href='#' className='reply-mentions' onClick={handleClick}>
      <FormattedMessage
        id='reply_mentions.reply'
        defaultMessage='Replying to {accounts}'
        values={{
          accounts: <FormattedList type='conjunction' value={accounts} />,
        }}
      />
    </a>
  );
};

export default ReplyMentions;
