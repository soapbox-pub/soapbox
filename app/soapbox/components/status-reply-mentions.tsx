import React from 'react';
import { FormattedList, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals';
import HoverRefWrapper from 'soapbox/components/hover-ref-wrapper';
import HoverStatusWrapper from 'soapbox/components/hover-status-wrapper';
import { useAppDispatch } from 'soapbox/hooks';
import { isPubkey } from 'soapbox/utils/nostr';

import type { Status } from 'soapbox/schemas';

interface IStatusReplyMentions {
  status: Pick<Status, 'id' | 'account' | 'mentions' | 'in_reply_to_id'>
  hoverable?: boolean
}

const StatusReplyMentions: React.FC<IStatusReplyMentions> = ({ status, hoverable = true }) => {
  const dispatch = useAppDispatch();
  const { account, mentions } = status;

  const handleOpenMentionsModal: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation();

    dispatch(openModal('MENTIONS', {
      username: account.acct,
      statusId: status.id,
    }));
  };

  if (!status.in_reply_to_id) {
    return null;
  }

  // The post is a reply, but it has no mentions.
  // Rare, but it can happen.
  if (mentions.length === 0) {
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
  const accounts = mentions.slice(0, 2).map((mention) => {
    const link = (
      <Link
        key={mention.id}
        to={`/@${mention.acct}`}
        className='reply-mentions__account max-w-[200px] truncate align-bottom'
        onClick={(e) => e.stopPropagation()}
      >
        @{isPubkey(mention.username) ? mention.username.slice(0, 8) : mention.username}
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
  });

  if (mentions.length > 2) {
    accounts.push(
      <span key='more' className='cursor-pointer hover:underline' role='button' onClick={handleOpenMentionsModal} tabIndex={0}>
        <FormattedMessage id='reply_mentions.more' defaultMessage='{count} more' values={{ count: mentions.length - 2 }} />
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
