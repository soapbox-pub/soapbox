import { useCallback } from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useCompose } from 'soapbox/hooks/useCompose.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { statusToMentionsAccountIdsArray } from 'soapbox/reducers/compose.ts';
import { makeGetStatus } from 'soapbox/selectors/index.ts';
import { shortenNostr } from 'soapbox/utils/nostr.ts';

import type { Status as StatusEntity } from 'soapbox/types/entities.ts';

interface IReplyMentions {
  composeId: string;
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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
      <Link to={'/'} className='inline-flex'>
        <button className='mb-1 cursor-pointer space-x-2 !border-none !bg-transparent !p-0 text-sm !text-gray-700 dark:!text-gray-600 rtl:space-x-reverse' onClick={handleClick}>
          <FormattedMessage
            id='reply_mentions.reply_empty'
            defaultMessage='Replying to post'
          />
        </button>
      </Link>
    );
  }

  const accounts = to.slice(0, 2).map((acct: string) => {
    const username = acct.split('@')[0];
    return (
      <span className='inline-block text-primary-600 no-underline hover:text-primary-700 hover:underline dark:text-accent-blue dark:hover:text-accent-blue'>{/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
        @{shortenNostr(username)}
      </span>
    );
  }).toArray();

  if (to.size > 2) {
    accounts.push(
      <FormattedMessage id='reply_mentions.more' defaultMessage='{count} more' values={{ count: to.size - 2 }} />,
    );
  }

  return (
    <Link to={'/'} className='inline-flex'>
      <button className='mb-1 cursor-pointer space-x-2 !border-none !p-0 text-sm !text-gray-700 focus:!ring-transparent focus:ring-offset-0  dark:!text-gray-600 rtl:space-x-reverse' onClick={handleClick}>
        <FormattedMessage
          id='reply_mentions.reply'
          defaultMessage='Replying to {accounts}'
          values={{
            accounts: <FormattedList type='conjunction' value={accounts} />,
          }}
        />
      </button>
    </Link>
  );
};

export default ReplyMentions;
