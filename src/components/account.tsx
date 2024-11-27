import pencilIcon from '@tabler/icons/outline/pencil.svg';
import { useRef, useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import HoverRefWrapper from 'soapbox/components/hover-ref-wrapper.tsx';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import Emoji from 'soapbox/components/ui/emoji.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import VerificationBadge from 'soapbox/components/verification-badge.tsx';
import ActionButton from 'soapbox/features/ui/components/action-button.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { getAcct } from 'soapbox/utils/accounts.ts';
import { displayFqn } from 'soapbox/utils/state.ts';

import Badge from './badge.tsx';
import RelativeTimestamp from './relative-timestamp.tsx';

import type { StatusApprovalStatus } from 'soapbox/normalizers/status.ts';
import type { Account as AccountSchema } from 'soapbox/schemas/index.ts';

interface IInstanceFavicon {
  account: AccountSchema;
  disabled?: boolean;
}

const messages = defineMessages({
  bot: { id: 'account.badges.bot', defaultMessage: 'Bot' },
});

const InstanceFavicon: React.FC<IInstanceFavicon> = ({ account, disabled }) => {
  const history = useHistory();
  const [missing, setMissing] = useState<boolean>(false);

  const handleError = () => setMissing(true);

  const handleClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();

    if (disabled) return;

    const timelineUrl = `/timeline/${account.domain}`;
    if (!(e.ctrlKey || e.metaKey)) {
      history.push(timelineUrl);
    } else {
      window.open(timelineUrl, '_blank');
    }
  };

  if (missing || !account.pleroma?.favicon) {
    return null;
  }

  return (
    <button
      className='size-4 flex-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
      onClick={handleClick}
      disabled={disabled}
    >
      <img
        src={account.pleroma.favicon}
        alt=''
        title={account.domain}
        className='max-h-full w-full'
        onError={handleError}
      />
    </button>
  );
};

interface IProfilePopper {
  condition: boolean;
  wrapper: (children: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
}

const ProfilePopper: React.FC<IProfilePopper> = ({ condition, wrapper, children }) => {
  return (
    <>
      {condition ? wrapper(children) : children}
    </>
  );
};

export interface IAccount {
  acct?: string;
  account: AccountSchema;
  action?: React.ReactElement;
  actionAlignment?: 'center' | 'top';
  actionIcon?: string;
  actionTitle?: string;
  /** Override other actions for specificity like mute/unmute. */
  actionType?: 'muting' | 'blocking' | 'follow_request';
  avatarSize?: number;
  hidden?: boolean;
  hideActions?: boolean;
  id?: string;
  onActionClick?: (account: any) => void;
  showProfileHoverCard?: boolean;
  timestamp?: string;
  timestampUrl?: string;
  futureTimestamp?: boolean;
  withAccountNote?: boolean;
  withDate?: boolean;
  withLinkToProfile?: boolean;
  withRelationship?: boolean;
  showEdit?: boolean;
  approvalStatus?: StatusApprovalStatus;
  emoji?: string;
  emojiUrl?: string;
  note?: string;
}

const Account = ({
  acct,
  account,
  actionType,
  action,
  actionIcon,
  actionTitle,
  actionAlignment = 'center',
  avatarSize = 42,
  hidden = false,
  hideActions = false,
  onActionClick,
  showProfileHoverCard = true,
  timestamp,
  timestampUrl,
  futureTimestamp = false,
  withAccountNote = false,
  withDate = false,
  withLinkToProfile = true,
  withRelationship = true,
  showEdit = false,
  approvalStatus,
  emoji,
  emojiUrl,
  note,
}: IAccount) => {
  const overflowRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  const me = useAppSelector((state) => state.me);
  const username = useAppSelector((state) => account ? getAcct(account, displayFqn(state)) : null);

  const handleAction = () => {
    onActionClick!(account);
  };

  const renderAction = () => {
    if (action) {
      return action;
    }

    if (hideActions) {
      return null;
    }

    if (onActionClick && actionIcon) {
      return (
        <IconButton
          src={actionIcon}
          title={actionTitle}
          onClick={handleAction}
          className='bg-transparent text-gray-600 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-500'
          iconClassName='h-4 w-4'
        />
      );
    }

    if (account.id !== me) {
      return <ActionButton account={account} actionType={actionType} />;
    }

    return null;
  };

  const intl = useIntl();

  if (!account) {
    return null;
  }

  if (hidden) {
    return (
      <>
        {account.display_name}
        {account.username}
      </>
    );
  }

  if (withDate) timestamp = account.created_at;

  const LinkEl: any = withLinkToProfile ? Link : 'div';
  const linkProps = withLinkToProfile ? {
    to: `/@${account.acct}`,
    title: account.acct,
    onClick: (event: React.MouseEvent) => event.stopPropagation(),
  } : {};

  return (
    <div data-testid='account' className='group block w-full shrink-0' ref={overflowRef}>
      <HStack alignItems={actionAlignment} space={3} justifyContent='between'>
        <HStack alignItems={withAccountNote || note ? 'top' : 'center'} space={3} className='overflow-hidden'>
          <ProfilePopper
            condition={showProfileHoverCard}
            wrapper={(children) => <HoverRefWrapper className='relative' accountId={account.id} inline>{children}</HoverRefWrapper>}
          >
            <LinkEl className='rounded-full' {...linkProps}>
              <Avatar src={account.avatar} size={avatarSize} />
              {emoji && (
                <div className='absolute -right-1.5 bottom-0'>
                  {emojiUrl ? (
                    <img className='size-5' src={emojiUrl} alt={emoji} />
                  ) : (
                    <Emoji size={20} emoji={emoji} />
                  )}
                </div>
              )}
            </LinkEl>
          </ProfilePopper>

          <div className='grow overflow-hidden'>
            <ProfilePopper
              condition={showProfileHoverCard}
              wrapper={(children) => <HoverRefWrapper accountId={account.id} inline>{children}</HoverRefWrapper>}
            >
              <LinkEl {...linkProps}>
                <HStack space={1} alignItems='center' grow>
                  <Text size='sm' weight='semibold' truncate>
                    {account.display_name}
                  </Text>

                  {account.verified && <VerificationBadge />}

                  {account.bot && <Badge slug='bot' title={intl.formatMessage(messages.bot)} />}
                </HStack>
              </LinkEl>
            </ProfilePopper>

            <Stack space={withAccountNote || note ? 1 : 0}>
              <HStack alignItems='center' space={1}>
                <Text theme='muted' size='sm' direction='ltr' truncate>@{acct ?? username}</Text> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}

                {account.pleroma?.favicon && (
                  <InstanceFavicon account={account} disabled={!withLinkToProfile} />
                )}

                {(timestamp) ? (
                  <>
                    <Text tag='span' theme='muted' size='sm'>&middot;</Text> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}

                    {timestampUrl ? (
                      <Link to={timestampUrl} className='hover:underline' onClick={(event) => event.stopPropagation()}>
                        <RelativeTimestamp timestamp={timestamp} theme='muted' size='sm' className='whitespace-nowrap' futureDate={futureTimestamp} />
                      </Link>
                    ) : (
                      <RelativeTimestamp timestamp={timestamp} theme='muted' size='sm' className='whitespace-nowrap' futureDate={futureTimestamp} />
                    )}
                  </>
                ) : null}

                {approvalStatus && ['pending', 'rejected'].includes(approvalStatus) && (
                  <>
                    <Text tag='span' theme='muted' size='sm'>&middot;</Text> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}

                    <Text tag='span' theme='muted' size='sm'>
                      {approvalStatus === 'pending'
                        ? <FormattedMessage id='status.approval.pending' defaultMessage='Pending approval' />
                        : <FormattedMessage id='status.approval.rejected' defaultMessage='Rejected' />}
                    </Text>
                  </>
                )}

                {showEdit ? (
                  <>
                    <Text tag='span' theme='muted' size='sm'>&middot;</Text> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}

                    <Icon className='size-5 text-gray-700 dark:text-gray-600' src={pencilIcon} />
                  </>
                ) : null}

                {actionType === 'muting' && account.mute_expires_at ? (
                  <>
                    <Text tag='span' theme='muted' size='sm'>&middot;</Text> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}

                    <Text theme='muted' size='sm'><RelativeTimestamp timestamp={account.mute_expires_at} futureDate /></Text>
                  </>
                ) : null}
              </HStack>

              {note ? (
                <Text
                  size='sm'
                  className='mr-2'
                >
                  {note}
                </Text>
              ) : withAccountNote && (
                <Text
                  truncate
                  size='sm'
                  dangerouslySetInnerHTML={{ __html: account.note }}
                  className='mr-2 rtl:ml-2 rtl:mr-0 [&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden'
                />
              )}
            </Stack>
          </div>
        </HStack>

        <div ref={actionRef}>
          {withRelationship ? renderAction() : null}
        </div>
      </HStack>
    </div>
  );
};

export default Account;
