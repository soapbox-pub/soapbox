import classNames from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { HotKeys } from 'react-hotkeys';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { NavLink, useHistory } from 'react-router-dom';

import { mentionCompose, replyCompose } from 'soapbox/actions/compose';
import { toggleFavourite, toggleReblog } from 'soapbox/actions/interactions';
import { openModal } from 'soapbox/actions/modals';
import { toggleStatusHidden } from 'soapbox/actions/statuses';
import Icon from 'soapbox/components/icon';
import TranslateButton from 'soapbox/components/translate-button';
import AccountContainer from 'soapbox/containers/account-container';
import QuotedStatus from 'soapbox/features/status/containers/quoted-status-container';
import { useAppDispatch, useSettings } from 'soapbox/hooks';
import { defaultMediaVisibility, textForScreenReader, getActualStatus } from 'soapbox/utils/status';

import StatusActionBar from './status-action-bar';
import StatusContent from './status-content';
import StatusMedia from './status-media';
import StatusReplyMentions from './status-reply-mentions';
import SensitiveContentOverlay from './statuses/sensitive-content-overlay';
import { Card, HStack, Stack, Text } from './ui';

import type { Map as ImmutableMap } from 'immutable';
import type {
  Account as AccountEntity,
  Status as StatusEntity,
} from 'soapbox/types/entities';

// Defined in components/scrollable_list
export type ScrollPosition = { height: number, top: number };

const messages = defineMessages({
  reblogged_by: { id: 'status.reblogged_by', defaultMessage: '{name} reposted' },
});

export interface IStatus {
  id?: string,
  status: StatusEntity,
  onClick?: () => void,
  muted?: boolean,
  hidden?: boolean,
  unread?: boolean,
  onMoveUp?: (statusId: string, featured?: boolean) => void,
  onMoveDown?: (statusId: string, featured?: boolean) => void,
  group?: ImmutableMap<string, any>,
  focusable?: boolean,
  featured?: boolean,
  hideActionBar?: boolean,
  hoverable?: boolean,
  variant?: 'default' | 'rounded',
  withDismiss?: boolean,
  accountAction?: React.ReactElement,
}

const Status: React.FC<IStatus> = (props) => {
  const {
    status,
    focusable = true,
    hoverable = true,
    onClick,
    onMoveUp,
    onMoveDown,
    muted,
    hidden,
    featured,
    unread,
    hideActionBar,
    variant = 'rounded',
    withDismiss,
  } = props;

  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const settings = useSettings();
  const displayMedia = settings.get('displayMedia') as string;
  const didShowCard = useRef(false);
  const node = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  const [showMedia, setShowMedia] = useState<boolean>(defaultMediaVisibility(status, displayMedia));
  const [minHeight, setMinHeight] = useState(208);

  const actualStatus = getActualStatus(status);

  const statusUrl = `/@${actualStatus.getIn(['account', 'acct'])}/posts/${actualStatus.id}`;

  // Track height changes we know about to compensate scrolling.
  useEffect(() => {
    didShowCard.current = Boolean(!muted && !hidden && status?.card);
  }, []);

  useEffect(() => {
    setShowMedia(defaultMediaVisibility(status, displayMedia));
  }, [status.id]);

  useEffect(() => {
    if (overlay.current) {
      setMinHeight(overlay.current.getBoundingClientRect().height);
    }
  }, [overlay.current]);

  const handleToggleMediaVisibility = (): void => {
    setShowMedia(!showMedia);
  };

  const handleClick = (e?: React.MouseEvent): void => {
    e?.stopPropagation();

    // If the user is selecting text, don't focus the status.
    if (getSelection()?.toString().length) {
      return;
    }

    if (!e || !(e.ctrlKey || e.metaKey)) {
      if (onClick) {
        onClick();
      } else {
        history.push(statusUrl);
      }
    } else {
      window.open(statusUrl, '_blank');
    }
  };

  const handleHotkeyOpenMedia = (e?: KeyboardEvent): void => {
    const status = actualStatus;
    const firstAttachment = status.media_attachments.first();

    e?.preventDefault();

    if (firstAttachment) {
      if (firstAttachment.type === 'video') {
        dispatch(openModal('VIDEO', { status, media: firstAttachment, time: 0 }));
      } else {
        dispatch(openModal('MEDIA', { status, media: status.media_attachments, index: 0 }));
      }
    }
  };

  const handleHotkeyReply = (e?: KeyboardEvent): void => {
    e?.preventDefault();
    dispatch(replyCompose(actualStatus));
  };

  const handleHotkeyFavourite = (): void => {
    toggleFavourite(actualStatus);
  };

  const handleHotkeyBoost = (e?: KeyboardEvent): void => {
    const modalReblog = () => dispatch(toggleReblog(actualStatus));
    const boostModal = settings.get('boostModal');
    if ((e && e.shiftKey) || !boostModal) {
      modalReblog();
    } else {
      dispatch(openModal('BOOST', { status: actualStatus, onReblog: modalReblog }));
    }
  };

  const handleHotkeyMention = (e?: KeyboardEvent): void => {
    e?.preventDefault();
    dispatch(mentionCompose(actualStatus.account as AccountEntity));
  };

  const handleHotkeyOpen = (): void => {
    history.push(statusUrl);
  };

  const handleHotkeyOpenProfile = (): void => {
    history.push(`/@${actualStatus.getIn(['account', 'acct'])}`);
  };

  const handleHotkeyMoveUp = (e?: KeyboardEvent): void => {
    if (onMoveUp) {
      onMoveUp(status.id, featured);
    }
  };

  const handleHotkeyMoveDown = (e?: KeyboardEvent): void => {
    if (onMoveDown) {
      onMoveDown(status.id, featured);
    }
  };

  const handleHotkeyToggleHidden = (): void => {
    dispatch(toggleStatusHidden(actualStatus));
  };

  const handleHotkeyToggleSensitive = (): void => {
    handleToggleMediaVisibility();
  };

  const handleHotkeyReact = (): void => {
    _expandEmojiSelector();
  };

  const _expandEmojiSelector = (): void => {
    const firstEmoji: HTMLDivElement | null | undefined = node.current?.querySelector('.emoji-react-selector .emoji-react-selector__emoji');
    firstEmoji?.focus();
  };

  if (!status) return null;
  let rebloggedByText, reblogElement, reblogElementMobile;

  if (hidden) {
    return (
      <div ref={node}>
        {actualStatus.getIn(['account', 'display_name']) || actualStatus.getIn(['account', 'username'])}
        {actualStatus.content}
      </div>
    );
  }

  if (status.filtered || actualStatus.filtered) {
    const minHandlers = muted ? undefined : {
      moveUp: handleHotkeyMoveUp,
      moveDown: handleHotkeyMoveDown,
    };

    return (
      <HotKeys handlers={minHandlers}>
        <div className={classNames('status__wrapper', 'status__wrapper--filtered', { focusable })} tabIndex={focusable ? 0 : undefined} ref={node}>
          <FormattedMessage id='status.filtered' defaultMessage='Filtered' />
        </div>
      </HotKeys>
    );
  }

  if (status.reblog && typeof status.reblog === 'object') {
    const displayNameHtml = { __html: String(status.getIn(['account', 'display_name_html'])) };

    reblogElement = (
      <NavLink
        to={`/@${status.getIn(['account', 'acct'])}`}
        onClick={(event) => event.stopPropagation()}
        className='hidden sm:flex items-center text-gray-700 dark:text-gray-600 text-xs font-medium space-x-1 hover:underline'
      >
        <Icon src={require('@tabler/icons/repeat.svg')} className='text-green-600' />

        <HStack alignItems='center'>
          <FormattedMessage
            id='status.reblogged_by'
            defaultMessage='{name} reposted'
            values={{
              name: <bdi className='max-w-[100px] truncate pr-1'>
                <strong className='text-gray-800 dark:text-gray-200' dangerouslySetInnerHTML={displayNameHtml} />
              </bdi>,
            }}
          />
        </HStack>
      </NavLink>
    );

    reblogElementMobile = (
      <div className='pb-5 -mt-2 sm:hidden truncate'>
        <NavLink
          to={`/@${status.getIn(['account', 'acct'])}`}
          onClick={(event) => event.stopPropagation()}
          className='flex items-center text-gray-700 dark:text-gray-600 text-xs font-medium space-x-1 hover:underline'
        >
          <Icon src={require('@tabler/icons/repeat.svg')} className='text-green-600' />

          <span>
            <FormattedMessage
              id='status.reblogged_by'
              defaultMessage='{name} reposted'
              values={{
                name: <bdi>
                  <strong className='text-gray-800 dark:text-gray-200' dangerouslySetInnerHTML={displayNameHtml} />
                </bdi>,
              }}
            />
          </span>
        </NavLink>
      </div>
    );

    rebloggedByText = intl.formatMessage(
      messages.reblogged_by,
      { name: String(status.getIn(['account', 'acct'])) },
    );
  }

  let quote;

  if (actualStatus.quote) {
    if (actualStatus.pleroma.get('quote_visible', true) === false) {
      quote = (
        <div className='quoted-status-tombstone'>
          <p><FormattedMessage id='statuses.quote_tombstone' defaultMessage='Post is unavailable.' /></p>
        </div>
      );
    } else {
      quote = <QuotedStatus statusId={actualStatus.quote as string} />;
    }
  }

  const handlers = muted ? undefined : {
    reply: handleHotkeyReply,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleHotkeyMention,
    open: handleHotkeyOpen,
    openProfile: handleHotkeyOpenProfile,
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
    toggleHidden: handleHotkeyToggleHidden,
    toggleSensitive: handleHotkeyToggleSensitive,
    openMedia: handleHotkeyOpenMedia,
    react: handleHotkeyReact,
  };

  const accountAction = props.accountAction || reblogElement;

  const isUnderReview = actualStatus.visibility === 'self';
  const isSensitive = actualStatus.hidden;

  return (
    <HotKeys handlers={handlers} data-testid='status'>
      <div
        className={classNames('status cursor-pointer', { focusable })}
        tabIndex={focusable && !muted ? 0 : undefined}
        data-featured={featured ? 'true' : null}
        aria-label={textForScreenReader(intl, actualStatus, rebloggedByText)}
        ref={node}
        onClick={handleClick}
        role='link'
      >
        {featured && (
          <div className='pt-4 px-4'>
            <HStack alignItems='center' space={1}>
              <Icon src={require('@tabler/icons/pinned.svg')} className='text-gray-600 dark:text-gray-400' />

              <Text size='sm' theme='muted' weight='medium'>
                <FormattedMessage id='status.pinned' defaultMessage='Pinned post' />
              </Text>
            </HStack>
          </div>
        )}

        <Card
          variant={variant}
          className={classNames('status__wrapper', `status-${actualStatus.visibility}`, {
            'py-6 sm:p-5': variant === 'rounded',
            'status-reply': !!status.in_reply_to_id,
            muted,
            read: unread === false,
          })}
          data-id={status.id}
        >
          {reblogElementMobile}

          <div className='mb-4'>
            <AccountContainer
              key={String(actualStatus.getIn(['account', 'id']))}
              id={String(actualStatus.getIn(['account', 'id']))}
              timestamp={actualStatus.created_at}
              timestampUrl={statusUrl}
              action={accountAction}
              hideActions={!accountAction}
              showEdit={!!actualStatus.edited_at}
              showProfileHoverCard={hoverable}
              withLinkToProfile={hoverable}
            />
          </div>

          <div className='status__content-wrapper'>
            <StatusReplyMentions status={actualStatus} hoverable={hoverable} />

            <Stack
              className='relative z-0'
              style={{ minHeight: isUnderReview || isSensitive ? Math.max(minHeight, 208) + 12 : undefined }}
            >
              {(isUnderReview || isSensitive) && (
                <SensitiveContentOverlay
                  status={status}
                  visible={showMedia}
                  onToggleVisibility={handleToggleMediaVisibility}
                  ref={overlay}
                />
              )}

              <Stack space={4}>
                <StatusContent
                  status={actualStatus}
                  onClick={handleClick}
                  collapsable
                  translatable
                />

                <TranslateButton status={actualStatus} />

                {(quote || actualStatus.card || actualStatus.media_attachments.size > 0) && (
                  <Stack space={4}>
                    <StatusMedia
                      status={actualStatus}
                      muted={muted}
                      onClick={handleClick}
                      showMedia={showMedia}
                      onToggleVisibility={handleToggleMediaVisibility}
                    />

                    {quote}
                  </Stack>
                )}
              </Stack>
            </Stack>

            {(!hideActionBar && !isUnderReview) && (
              <div className='pt-4'>
                <StatusActionBar status={actualStatus} withDismiss={withDismiss} />
              </div>
            )}
          </div>
        </Card>
      </div >
    </HotKeys >
  );
};

export default Status;
