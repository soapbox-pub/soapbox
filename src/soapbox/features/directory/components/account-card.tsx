import clsx from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { getSettings } from 'soapbox/actions/settings';
import { useAccount } from 'soapbox/api/hooks';
import Account from 'soapbox/components/account';
import Badge from 'soapbox/components/badge';
import RelativeTimestamp from 'soapbox/components/relative-timestamp';
import { Stack, Text } from 'soapbox/components/ui';
import ActionButton from 'soapbox/features/ui/components/action-button';
import { useAppSelector } from 'soapbox/hooks';
import { shortNumberFormat } from 'soapbox/utils/numbers';

interface IAccountCard {
  id: string
}

const AccountCard: React.FC<IAccountCard> = ({ id }) => {
  const me = useAppSelector((state) => state.me);
  const { account } = useAccount(id);
  const autoPlayGif = useAppSelector((state) => getSettings(state).get('autoPlayGif'));

  if (!account) return null;

  const followedBy = me !== account.id && account.relationship?.followed_by;

  return (
    <div className='flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow dark:divide-primary-700 dark:bg-primary-800'>
      <div className='relative'>
        {followedBy && (
          <div className='absolute left-2.5 top-2.5'>
            <Badge
              slug='opaque'
              title={<FormattedMessage id='account.follows_you' defaultMessage='Follows you' />}
            />
          </div>
        )}

        <div className='absolute bottom-2.5 right-2.5'>
          <ActionButton account={account} small />
        </div>

        <img
          src={autoPlayGif ? account.header : account.header_static}
          alt=''
          className='h-32 w-full rounded-t-lg object-cover'
        />
      </div>

      <Stack space={4} className='p-3'>
        <Account
          account={account}
          withRelationship={false}
        />

        <Text
          truncate
          align='left'
          className={clsx('[&_br]:hidden [&_p:first-child]:inline [&_p:first-child]:truncate [&_p]:hidden')}
          dangerouslySetInnerHTML={{ __html: account.note_emojified || '&nbsp;' }}
        />
      </Stack>

      <div className='grid grid-cols-3 gap-1 py-4'>
        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {shortNumberFormat(account.statuses_count)}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.posts' defaultMessage='Posts' />
          </Text>
        </Stack>

        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {shortNumberFormat(account.followers_count)}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.followers' defaultMessage='Followers' />
          </Text>
        </Stack>

        <Stack>
          <Text theme='primary' size='md' weight='medium'>
            {account.last_status_at ? (
              <RelativeTimestamp theme='inherit' timestamp={account.last_status_at} />
            ) : (
              <FormattedMessage id='account.never_active' defaultMessage='Never' />
            )}
          </Text>

          <Text theme='muted' size='sm'>
            <FormattedMessage id='account.last_status' defaultMessage='Last active' />
          </Text>
        </Stack>
      </div>
    </div>
  );
};

export default AccountCard;
