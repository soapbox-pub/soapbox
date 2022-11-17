import classNames from 'clsx';
import { List as ImmutableList } from 'immutable';
import React from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { useDispatch } from 'react-redux';

import { openModal } from 'soapbox/actions/modals';
import { HStack, Text, Emoji } from 'soapbox/components/ui';
import { useAppSelector, useSoapboxConfig, useFeatures } from 'soapbox/hooks';
import { reduceEmoji } from 'soapbox/utils/emoji-reacts';

import type { Status } from 'soapbox/types/entities';

interface IStatusInteractionBar {
  status: Status,
}

const StatusInteractionBar: React.FC<IStatusInteractionBar> = ({ status }): JSX.Element | null => {
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
      0,
      false,
      allowedEmoji,
    ).reverse();
  };

  const handleOpenReblogsModal: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    if (!me) onOpenUnauthorizedModal();
    else onOpenReblogsModal(account.acct, status.id);
  };

  const getReposts = () => {
    if (status.reblogs_count) {
      return (
        <button
          type='button'
          onClick={handleOpenReblogsModal}
          className='text-gray-600 dark:text-gray-700 hover:underline'
        >
          <HStack space={1} alignItems='center'>
            <Text theme='primary' size='sm' weight='bold'>
              <FormattedNumber value={status.reblogs_count} />
            </Text>

            <Text theme='muted' size='sm'>
              <FormattedMessage
                id='status.interactions.reblogs'
                defaultMessage='{count, plural, one {Repost} other {Reposts}}'
                values={{ count: status.reblogs_count }}
              />
            </Text>
          </HStack>
        </button>
      );
    }

    return '';
  };

  const handleOpenFavouritesModal: React.EventHandler<React.MouseEvent<HTMLButtonElement>> = (e) => {
    e.preventDefault();

    if (!me) onOpenUnauthorizedModal();
    else onOpenFavouritesModal(account.acct, status.id);
  };

  const getFavourites = () => {
    if (status.favourites_count) {
      return (
        <button
          type='button'
          onClick={features.exposableReactions ? handleOpenFavouritesModal : undefined}
          className={
            classNames({
              'text-gray-600 dark:text-gray-700 hover:underline': true,
              'hover:underline': features.exposableReactions,
              'cursor-default': !features.exposableReactions,
            })
          }
        >
          <HStack space={1} alignItems='center'>
            <Text theme='primary' size='sm' weight='bold'>
              <FormattedNumber value={status.favourites_count} />
            </Text>

            <Text theme='muted' size='sm'>
              <FormattedMessage
                id='status.interactions.favourites'
                defaultMessage='{count, plural, one {Like} other {Likes}}'
                values={{ count: status.favourites_count }}
              />
            </Text>
          </HStack>
        </button>
      );
    }

    return '';
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

    return (
      <button
        type='button'
        onClick={features.exposableReactions ? handleOpenReactionsModal : undefined}
        className={
          classNames({
            'text-gray-600 dark:text-gray-700': true,
            'hover:underline': features.exposableReactions,
            'cursor-default': !features.exposableReactions,
          })
        }
      >
        <HStack space={1} alignItems='center'>
          <Text theme='primary' size='sm' weight='bold'>
            <FormattedNumber value={count} />
          </Text>

          <HStack space={0.5} alignItems='center'>
            {emojiReacts.map((e, i) => {
              return (
                <Emoji
                  key={i}
                  className={classNames('w-5 h-5 flex-none')}
                  emoji={e.get('name')}
                />
              );
            })}
          </HStack>
        </HStack>
      </button>
    );
  };

  return (
    <HStack space={3}>
      {getReposts()}
      {getFavourites()}
      {features.emojiReacts ? getEmojiReacts() : null}
    </HStack>
  );
};

export default StatusInteractionBar;
