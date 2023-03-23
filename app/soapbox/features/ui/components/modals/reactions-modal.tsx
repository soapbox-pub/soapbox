import clsx from 'clsx';
import { List as ImmutableList } from 'immutable';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { fetchFavourites, fetchReactions } from 'soapbox/actions/interactions';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Emoji, Modal, Spinner, Tabs } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { ReactionRecord } from 'soapbox/reducers/user-lists';

import type { Item } from 'soapbox/components/ui/tabs/tabs';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  all: { id: 'reactions.all', defaultMessage: 'All' },
});

interface IAccountWithReaction {
  id: string
  reaction: string
  reactionUrl?: string
}

interface IReactionsModal {
  onClose: (string: string) => void
  statusId: string
  reaction?: string
}

const ReactionsModal: React.FC<IReactionsModal> = ({ onClose, statusId, reaction: initialReaction }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [reaction, setReaction] = useState(initialReaction);
  const reactions = useAppSelector<ImmutableList<ReturnType<typeof ReactionRecord>> | undefined>((state) => {
    const favourites = state.user_lists.favourited_by.get(statusId)?.items;
    const reactions = state.user_lists.reactions.get(statusId)?.items;
    return favourites && reactions && ImmutableList(favourites?.size ? [ReactionRecord({ accounts: favourites, count: favourites.size, name: '👍' })] : []).concat(reactions || []);
  });

  const fetchData = () => {
    dispatch(fetchFavourites(statusId));
    dispatch(fetchReactions(statusId));
  };

  const onClickClose = () => {
    onClose('REACTIONS');
  };

  const renderFilterBar = () => {
    const items: Array<Item> = [
      {
        text: intl.formatMessage(messages.all),
        action: () => setReaction(''),
        name: 'all',
      },
    ];

    reactions!.forEach(reaction => items.push(
      {
        text: <div className='flex items-center gap-1'>
          <Emoji className='h-4 w-4' emoji={reaction.name} src={reaction.url || undefined} />
          {reaction.count}
        </div>,
        action: () => setReaction(reaction.name),
        name: reaction.name,
      },
    ));

    return <Tabs items={items} activeItem={reaction || 'all'} />;
  };

  const accounts = useMemo((): ImmutableList<IAccountWithReaction> | undefined  => {
    if (!reactions) return;

    if (reaction) {
      const reactionRecord = reactions.find(({ name }) => name === reaction);

      if (reactionRecord) return reactionRecord.accounts.map(account => ({ id: account, reaction: reaction, reactionUrl: reactionRecord.url || undefined })).toList();
    } else {
      return reactions.map(({ accounts, name, url }) => accounts.map(account => ({ id: account, reaction: name, reactionUrl: url }))).flatten() as ImmutableList<IAccountWithReaction>;
    }
  }, [reactions, reaction]);

  useEffect(() => {
    fetchData();
  }, []);

  let body;

  if (!accounts || !reactions) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='status.reactions.empty' defaultMessage='No one has reacted to this post yet. When someone does, they will show up here.' />;

    body = (<>
      {reactions.size > 0 && renderFilterBar()}
      <ScrollableList
        scrollKey='reactions'
        emptyMessage={emptyMessage}
        className={clsx('max-w-full', {
          'mt-4': reactions.size > 0,
        })}
        itemClassName='pb-3'
      >
        {accounts.map((account) =>
          <AccountContainer key={`${account.id}-${account.reaction}`} id={account.id} emoji={account.reaction} emojiUrl={account.reactionUrl} />,
        )}
      </ScrollableList>
    </>);
  }

  return (
    <Modal
      title={<FormattedMessage id='column.reactions' defaultMessage='Reactions' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export default ReactionsModal;
