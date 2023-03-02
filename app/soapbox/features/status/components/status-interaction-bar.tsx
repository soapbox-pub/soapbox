import clsx from 'clsx';
import { List as ImmutableList } from 'immutable';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals';
import { HStack, Text, Emoji } from 'soapbox/components/ui';
import { useAppSelector, useSoapboxConfig, useFeatures } from 'soapbox/hooks';
import { reduceEmoji } from 'soapbox/utils/emoji-reacts';
import { shortNumberFormat } from 'soapbox/utils/numbers';

import type { Status } from 'soapbox/types/entities';

interface IStatusInteractionBar {
  status: Status
}

const StatusInteractionBar: React.FC<IStatusInteractionBar> = ({ status }): JSX.Element | null => {
  const history = useHistory();

  const me = useAppSelector(({ me }) => me);
  const { allowedEmoji } = useSoapboxConfig();
  const dispatch = useDispatch();
  const features = useFeatures();
  const { account } = status;

  if (!account || typeof account !== 'object') return null;

  const onOpenUnauthorizedModal = () => {
    dispatch(openModal('UNAUTHORIZED'));
  };

  const onOpenReblogsModal = (username: string, statusId: string): void => {
    dispatch(openModal('REBLOGS', {
      username,
      statusId,
    }));
  };

  const onOpenFavouritesModal = (username: string, statusId: string): void => {
    dispatch(openModal('FAVOURITES', {
      username,
      statusId,
    }));
  };

  const onOpenReactionsModal = (username: string, statusId: string): void => {
    dispatch(openModal('REACTIONS', {
      username,
      statusId,
    }));
  };

  const getNormalizedReacts = () => {
    return reduceEmoji(
      ImmutableList(status.pleroma.get('emoji_reactions') as any),
      status.favourites_count,
      status.favourited,
      allowedEmoji,
    );
  };

  const handleOpenReblogsModal: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    if (!me) onOpenUnauthorizedModal();
    else onOpenReblogsModal(account.acct, status.id);
  };

  const getReposts = () => {
    if (status.reblogs_count) {
      return (
        <InteractionCounter count={status.reblogs_count} onClick={handleOpenReblogsModal}>
          <FormattedMessage
            id='status.interactions.reblogs'
            defaultMessage='{count, plural, one {Repost} other {Reposts}}'
            values={{ count: status.reblogs_count }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  const navigateToQuotes: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    history.push(`/@${status.getIn(['account', 'acct'])}/posts/${status.id}/quotes`);
  };

  const getQuotes = () => {
    if (status.quotes_count) {
      return (
        <InteractionCounter count={status.quotes_count} onClick={navigateToQuotes}>
          <FormattedMessage
            id='status.interactions.quotes'
            defaultMessage='{count, plural, one {Quote} other {Quotes}}'
            values={{ count: status.quotes_count }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  const handleOpenFavouritesModal: React.EventHandler<React.MouseEvent<HTMLButtonElement>> = (e) => {
    e.preventDefault();

    if (!me) onOpenUnauthorizedModal();
    else onOpenFavouritesModal(account.acct, status.id);
  };

  const getFavourites = () => {
    if (status.favourites_count) {
      return (
        <InteractionCounter count={status.favourites_count} onClick={features.exposableReactions ? handleOpenFavouritesModal : undefined}>
          <FormattedMessage
            id='status.interactions.favourites'
            defaultMessage='{count, plural, one {Like} other {Likes}}'
            values={{ count: status.favourites_count }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  const handleOpenReactionsModal = () => {
    if (!me) {
      return onOpenUnauthorizedModal();
    }

    onOpenReactionsModal(account.acct, status.id);
  };

  const getEmojiReacts = () => {
    const emojiReacts = getNormalizedReacts();
    const count = emojiReacts.reduce((acc, cur) => (
      acc + cur.get('count')
    ), 0);

    if (count) {
      return (
        <InteractionCounter count={count} onClick={features.exposableReactions ? handleOpenReactionsModal : undefined}>
          <HStack space={0.5} alignItems='center'>
            {emojiReacts.take(3).map((e, i) => {
              return (
                <Emoji
                  key={i}
                  className='h-4.5 w-4.5 flex-none'
                  emoji={e.get('name')}
                />
              );
            })}
          </HStack>
        </InteractionCounter>
      );
    }

    return null;
  };

  return (
    <HStack space={3}>
      {getReposts()}
      {getQuotes()}
      {features.emojiReacts ? getEmojiReacts() : getFavourites()}
    </HStack>
  );
};

interface IInteractionCounter {
  count: number
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  children: React.ReactNode
}

const InteractionCounter: React.FC<IInteractionCounter> = ({ count, onClick, children }) => {
  const features = useFeatures();

  return (
    <button
      type='button'
      onClick={onClick}
      className={
        clsx({
          'text-gray-600 dark:text-gray-700': true,
          'hover:underline': features.exposableReactions,
          'cursor-default': !features.exposableReactions,
        })
      }
    >
      <HStack space={1} alignItems='center'>
        <Text theme='primary' weight='bold'>
          {shortNumberFormat(count)}
        </Text>

        <Text tag='div' theme='muted'>
          {children}
        </Text>
      </HStack>
    </button>
  );
};

export default StatusInteractionBar;
