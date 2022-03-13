import PropTypes from 'prop-types';
import * as React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import HoverRefWrapper from 'soapbox/components/hover_ref_wrapper';
import VerificationBadge from 'soapbox/components/verification_badge';
import ActionButton from 'soapbox/features/ui/components/action_button';
import { getAcct } from 'soapbox/utils/accounts';
import { displayFqn } from 'soapbox/utils/state';

import RelativeTimestamp from './relative_timestamp';
import { Avatar, HStack, IconButton, Text } from './ui';

const ProfilePopper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

const Account = ({
  account,
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
  withRelationship = true,
}) => {
  const me = useSelector((state) => state.get('me'));
  const username = useSelector((state) => account ? getAcct(account, displayFqn(state)) : null);

  const handleAction = () => {
    onActionClick(account);
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
          className='bg-transparent text-gray-400 hover:text-gray-600'
          iconClassName='w-4 h-4'
        />
      );
    }

    if (account.get('id') !== me && account.get('relationship', null) !== null) {
      return <ActionButton account={account} />;
    }

    return null;
  };

  if (!account) {
    return null;
  }

  if (hidden) {
    return (
      <>
        {account.get('display_name')}
        {account.get('username')}
      </>
    );
  }

  const LinkEl = showProfileHoverCard ? Link : 'div';

  return (
    <div className='flex-shrink-0 group block w-full'>
      <HStack alignItems={actionAlignment} justifyContent='between'>
        <HStack alignItems='center' space={3}>
          <ProfilePopper
            condition={showProfileHoverCard}
            wrapper={(children) => <HoverRefWrapper accountId={account.get('id')} inline>{children}</HoverRefWrapper>}
          >
            <LinkEl
              to={`/@${account.get('acct')}`}
              title={account.get('acct')}
              onClick={(event) => event.stopPropagation()}
            >
              <Avatar src={account.get('avatar')} size={avatarSize} />
            </LinkEl>
          </ProfilePopper>

          <div>
            <ProfilePopper
              condition={showProfileHoverCard}
              wrapper={(children) => <HoverRefWrapper accountId={account.get('id')} inline>{children}</HoverRefWrapper>}
            >
              <LinkEl
                to={`/@${account.get('acct')}`}
                title={account.get('acct')}
                onClick={(event) => event.stopPropagation()}
              >
                <div className='flex items-center space-x-1'>
                  <div className='max-w-[250px]'>
                    <Text
                      size='sm'
                      weight='semibold'
                      truncate
                      dangerouslySetInnerHTML={{ __html: account.get('display_name_html') }}
                    />
                  </div>

                  {account.get('verified') && <VerificationBadge />}
                </div>
              </LinkEl>
            </ProfilePopper>

            <HStack alignItems='center' space={1}>
              <Text theme='muted' size='sm'>@{username}</Text>

              {(timestamp) ? (
                <>
                  <Text tag='span' theme='muted' size='sm'>&middot;</Text>

                  {timestampUrl ? (
                    <Link to={timestampUrl} className='hover:underline'>
                      <RelativeTimestamp timestamp={timestamp} theme='muted' size='sm' />
                    </Link>
                  ) : (
                    <RelativeTimestamp timestamp={timestamp} theme='muted' size='sm' />
                  )}
                </>
              ) : null}
            </HStack>
          </div>
        </HStack>

        {withRelationship ? renderAction() : null}
      </HStack>
    </div>
  );
};

Account.propTypes = {
  account: ImmutablePropTypes.map.isRequired,
  action: PropTypes.node,
  actionAlignment: PropTypes.oneOf(['center', 'top']),
  actionIcon: PropTypes.string,
  actionTitle: PropTypes.string,
  avatarSize: PropTypes.number,
  hidden: PropTypes.bool,
  hideActions: PropTypes.bool,
  onActionClick: PropTypes.func,
  showProfileHoverCard: PropTypes.bool,
  timestamp: PropTypes.string,
  timestampUrl: PropTypes.string,
  withRelationship: PropTypes.bool,
};

export default Account;
