import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { IconButton } from 'soapbox/components/ui';
import { useAppSelector, useSoapboxConfig } from 'soapbox/hooks';
import { isLocal } from 'soapbox/utils/accounts';
import { parseVersion, MASTODON, PLEROMA } from 'soapbox/utils/features';

import type { Account as AccountEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  subscribeFeed: { id: 'account.rss_feed', defaultMessage: 'Subscribe to RSS feed' },
});

interface IFeedButton {
  account: AccountEntity
}

const FeedButton = ({ account }: IFeedButton) => {
  const intl = useIntl();
  const { featureFeeds } = useSoapboxConfig();

  const { software } = useAppSelector((state) => parseVersion(state.instance.version));

  let feedUrl: string | undefined;

  switch (software) {
    case MASTODON:
      feedUrl = `${account.url}.rss`;
      break;
    case PLEROMA:
      feedUrl = `${account.url}/feed.rss`;
      break;
  }

  if (!featureFeeds || !feedUrl || !isLocal(account)) return null;

  return (
    <IconButton
      src={require('@tabler/icons/rss.svg')}
      onClick={() => window.open(feedUrl, '_blank')}
      title={intl.formatMessage(messages.subscribeFeed)}
      theme='outlined'
      className='px-[10px]'
      iconClassName='w-4 h-4'
    />
  );
};

export default FeedButton;
