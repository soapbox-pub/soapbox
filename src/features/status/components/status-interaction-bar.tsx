import clsx from 'clsx';import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals.ts';
import Emoji from 'soapbox/components/ui/emoji.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import { reduceEmoji } from 'soapbox/utils/emoji-reacts.ts';
import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

import type { Status } from 'soapbox/types/entities.ts';

interface IStatusInteractionBar {
  status: Status;
}

const StatusInteractionBar: React.FC<IStatusInteractionBar> = ({ status }): JSX.Element | null => {
  const me = useAppSelector(({ me }) => me);
  const { allowedEmoji } = useSoapboxConfig();
  const dispatch = useAppDispatch();
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

  const onOpenDislikesModal = (username: string, statusId: string): void => {
    dispatch(openModal('DISLIKES', {
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

  const onOpenZapsModal = (username: string, statusId: string): void => {
    dispatch(openModal('ZAPS', {
      username,
      statusId,
    }));
  };

  const getNormalizedReacts = () => {
    return reduceEmoji(
      status.reactions,
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

  const getQuotes = () => {
    if (status.quotes_count) {
      return (
        <InteractionCounter count={status.quotes_count} to={`/@${status.getIn(['account', 'acct'])}/posts/${status.id}/quotes`}>
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

  const handleOpenDislikesModal: React.EventHandler<React.MouseEvent<HTMLButtonElement>> = (e) => {
    e.preventDefault();

    if (!me) onOpenUnauthorizedModal();
    else onOpenDislikesModal(account.acct, status.id);
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

  const getDislikes = () => {
    const dislikesCount = status.dislikes_count;

    if (dislikesCount) {
      return (
        <InteractionCounter count={status.favourites_count} onClick={features.exposableReactions ? handleOpenDislikesModal : undefined}>
          <FormattedMessage
            id='status.interactions.dislikes'
            defaultMessage='{count, plural, one {Dislike} other {Dislikes}}'
            values={{ count: dislikesCount }}
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
      acc + (cur.count || 0)
    ), 0);

    const handleClick = features.emojiReacts ? handleOpenReactionsModal : handleOpenFavouritesModal;

    if (count) {
      return (
        <InteractionCounter count={count} onClick={features.exposableReactions ? handleClick : undefined}>
          <HStack space={0.5} alignItems='center'>
            {emojiReacts.take(3).map((emoji, i) => {
              if (emoji.url) {
                return <img key={i} src={emoji.url} alt={emoji.name} className='size-4.5 flex-none' />;
              } else {
                return <div key={i} className='flex-none'><Emoji size={18} emoji={emoji.name} /></div>;
              }
            })}
          </HStack>
        </InteractionCounter>
      );
    }

    return null;
  };

  const handleOpenZapsModal = () => {
    if (!me) {
      return onOpenUnauthorizedModal();
    }

    onOpenZapsModal(account.acct, status.id);
  };

  const getZaps = () => {
    if (status.zaps_amount || status.zaps_amount_cashu) {
      return (
        <InteractionCounter count={(status.zaps_amount ?? 0) / 1000 + (status.zaps_amount_cashu ?? 0)} onClick={handleOpenZapsModal}>
          <FormattedMessage
            id='status.interactions.zaps'
            defaultMessage='{count, plural, one {Zap} other {Zaps}}'
            values={{ count: (status.zaps_amount ?? 0) / 1000 + (status.zaps_amount_cashu ?? 0) }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  return (
    <HStack space={3}>
      {getReposts()}
      {getQuotes()}
      {(features.emojiReacts || features.emojiReactsMastodon) ? getEmojiReacts() : getFavourites()}
      {getZaps()}
      {getDislikes()}
    </HStack>
  );
};

interface IInteractionCounter {
  count: number;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  to?: string;
}

const InteractionCounter: React.FC<IInteractionCounter> = ({ count, children, onClick, to }) => {
  const features = useFeatures();

  const className = clsx({
    'text-gray-600 dark:text-gray-700': true,
    'hover:underline': features.exposableReactions,
    'cursor-default': !features.exposableReactions,
  });

  const body = (
    <HStack space={1} alignItems='center'>
      <Text weight='bold'>
        {shortNumberFormat(count)}
      </Text>

      <Text tag='div' theme='muted'>
        {children}
      </Text>
    </HStack>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type='button'
      onClick={onClick}
      className={className}
    >
      {body}
    </button>
  );
};

export default StatusInteractionBar;
