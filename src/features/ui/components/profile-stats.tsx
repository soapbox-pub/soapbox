import flameIcon from '@tabler/icons/filled/flame.svg';
import { useIntl, defineMessages } from 'react-intl';
import { NavLink } from 'react-router-dom';

import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Tooltip from 'soapbox/components/ui/tooltip.tsx';
import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

import type { Account } from 'soapbox/schemas/index.ts';

const messages = defineMessages({
  followers: { id: 'account.followers', defaultMessage: 'Followers' },
  follows: { id: 'account.follows', defaultMessage: 'Following' },
  streak: { id: 'account.streak', defaultMessage: 'Day Streak' },
});

interface IProfileStats {
  account: Pick<Account, 'acct' | 'followers_count' | 'following_count' | 'ditto'> | undefined;
  onClickHandler?: React.MouseEventHandler;
}

/** Display follower and following counts for an account. */
const ProfileStats: React.FC<IProfileStats> = ({ account, onClickHandler }) => {
  const intl = useIntl();

  if (!account) {
    return null;
  }

  return (
    <HStack alignItems='center' space={3}>
      <NavLink to={`/@${account.acct}/followers`} onClick={onClickHandler} title={intl.formatNumber(account.followers_count)} className='hover:underline'>
        <HStack alignItems='center' space={1}>
          <Text theme='primary' weight='bold' size='sm'>
            {shortNumberFormat(account.followers_count)}
          </Text>
          <Text weight='bold' size='sm'>
            {intl.formatMessage(messages.followers)}
          </Text>
        </HStack>
      </NavLink>

      <NavLink to={`/@${account.acct}/following`} onClick={onClickHandler} title={intl.formatNumber(account.following_count)} className='hover:underline'>
        <HStack alignItems='center' space={1}>
          <Text theme='primary' weight='bold' size='sm'>
            {shortNumberFormat(account.following_count)}
          </Text>
          <Text weight='bold' size='sm'>
            {intl.formatMessage(messages.follows)}
          </Text>
        </HStack>
      </NavLink>

      {account.ditto.streak.days > 0 && (
        <Tooltip
          text={new Date(account.ditto.streak.start!).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        >
          <HStack alignItems='center'>
            <Text theme='primary' weight='bold' size='sm'>
              <span role='img' aria-label={intl.formatMessage(messages.streak)}>
                <Icon src={flameIcon} className='size-4' />
              </span>
            </Text>
            <Text weight='bold' size='sm'>
              <>{shortNumberFormat(account.ditto.streak.days)}</>
            </Text>
          </HStack>
        </Tooltip>
      )}
    </HStack>
  );
};

export default ProfileStats;
