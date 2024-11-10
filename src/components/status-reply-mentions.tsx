import { FormattedList, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals.ts';
import HoverRefWrapper from 'soapbox/components/hover-ref-wrapper.tsx';
import HoverStatusWrapper from 'soapbox/components/hover-status-wrapper.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { shortenNostr } from 'soapbox/utils/nostr.ts';

import type { Status } from 'soapbox/types/entities.ts';

interface IStatusReplyMentions {
  status: Status;
  hoverable?: boolean;
}

const StatusReplyMentions: React.FC<IStatusReplyMentions> = ({ status, hoverable = true }) => {
  const dispatch = useAppDispatch();

  const handleOpenMentionsModal: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();

    const account = status.account;

    dispatch(openModal('MENTIONS', {
      username: account.acct,
      statusId: status.id,
    }));
  };

  if (!status.in_reply_to_id) {
    return null;
  }

  const to = status.mentions;

  // The post is a reply, but it has no mentions.
  // Rare, but it can happen.
  if (to.size === 0) {
    return (
      <div className='reply-mentions'>
        <FormattedMessage
          id='reply_mentions.reply_empty'
          defaultMessage='Replying to post'
        />
      </div>
    );
  }

  // The typical case with a reply-to and a list of mentions.
  const accounts = to.slice(0, 2).map(account => {
    const link = (
      <Link
        key={account.id}
        to={`/@${account.acct}`}
        className='reply-mentions__account max-w-[200px] truncate align-bottom'
        onClick={(e) => e.stopPropagation()}
      > {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
        @{shortenNostr(account.username)}
      </Link>
    );

    if (hoverable) {
      return (
        <HoverRefWrapper key={account.id} accountId={account.id} inline>
          {link}
        </HoverRefWrapper>
      );
    } else {
      return link;
    }
  }).toArray();

  if (to.size > 2) {
    accounts.push(
      <span key='more' className='cursor-pointer hover:underline' role='button' onClick={handleOpenMentionsModal} tabIndex={0}>
        <FormattedMessage id='reply_mentions.more' defaultMessage='{count} more' values={{ count: to.size - 2 }} />
      </span>,
    );
  }

  return (
    <div className='reply-mentions'>
      <FormattedMessage
        id='reply_mentions.reply.hoverable'
        defaultMessage='<hover>Replying to</hover> {accounts}'
        values={{
          accounts: <FormattedList type='conjunction' value={accounts} />,
          // @ts-ignore wtf?
          hover: (children: React.ReactNode) => {
            if (hoverable) {
              return (
                <HoverStatusWrapper statusId={status.in_reply_to_id} inline>
                  <span
                    key='hoverstatus'
                    className='cursor-pointer hover:underline'
                    role='presentation'
                  >
                    {children}
                  </span>
                </HoverStatusWrapper>
              );
            } else {
              return children;
            }
          },
        }}
      />
    </div>
  );
};

export default StatusReplyMentions;
