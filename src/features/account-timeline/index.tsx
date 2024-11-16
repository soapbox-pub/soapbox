import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchAccountByUsername } from 'soapbox/actions/accounts.ts';
import { fetchPatronAccount } from 'soapbox/actions/patron.ts';
import { expandAccountFeaturedTimeline, expandAccountTimeline } from 'soapbox/actions/timelines.ts';
import { useAccountLookup } from 'soapbox/api/hooks/index.ts';
import MissingIndicator from 'soapbox/components/missing-indicator.tsx';
import StatusList from 'soapbox/components/status-list.tsx';
import { Card, CardBody } from 'soapbox/components/ui/card.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useSettings } from 'soapbox/hooks/useSettings.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import { makeGetStatusIds } from 'soapbox/selectors/index.ts';

const getStatusIds = makeGetStatusIds();

interface IAccountTimeline {
  params: {
    username: string;
  };
  withReplies?: boolean;
}

const AccountTimeline: React.FC<IAccountTimeline> = ({ params, withReplies = false }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const settings = useSettings();
  const soapboxConfig = useSoapboxConfig();

  const { account } = useAccountLookup(params.username, { withRelationship: true });
  const [accountLoading, setAccountLoading] = useState<boolean>(!account);

  const path = withReplies ? `${account?.id}:with_replies` : account?.id;
  const showPins = settings.account_timeline.shows.pinned && !withReplies;
  const statusIds = useAppSelector(state => getStatusIds(state, { type: `account:${path}`, prefix: 'account_timeline' }));
  const featuredStatusIds = useAppSelector(state => getStatusIds(state, { type: `account:${account?.id}:pinned`, prefix: 'account_timeline' }));

  const isBlocked = useAppSelector(state => state.relationships.getIn([account?.id, 'blocked_by']) === true);
  const unavailable = isBlocked && !features.blockersVisible;
  const patronEnabled = soapboxConfig.getIn(['extensions', 'patron', 'enabled']) === true;
  const isLoading = useAppSelector(state => state.timelines.getIn([`account:${path}`, 'isLoading']) === true);
  const hasMore = useAppSelector(state => state.timelines.getIn([`account:${path}`, 'hasMore']) === true);
  const next = useAppSelector(state => state.timelines.get(`account:${path}`)?.next);

  const accountUsername = account?.username || params.username;

  useEffect(() => {
    dispatch(fetchAccountByUsername(params.username, history))
      .then(() => setAccountLoading(false))
      .catch(() => setAccountLoading(false));
  }, [params.username]);

  useEffect(() => {
    if (account && !withReplies) {
      dispatch(expandAccountFeaturedTimeline(account.id));
    }
  }, [account?.id, withReplies]);

  useEffect(() => {
    if (account && patronEnabled) {
      dispatch(fetchPatronAccount(account.url));
    }
  }, [account?.url, patronEnabled]);

  useEffect(() => {
    if (account) {
      dispatch(expandAccountTimeline(account.id, { withReplies }));
    }
  }, [account?.id, withReplies]);

  const handleLoadMore = (maxId: string) => {
    if (account) {
      dispatch(expandAccountTimeline(account.id, { url: next, maxId, withReplies }));
    }
  };

  if (!account && accountLoading) {
    return <Spinner />;
  } else if (!account) {
    return <MissingIndicator nested />;
  }

  if (unavailable) {
    return (
      <Card>
        <CardBody>
          <Text align='center'>
            {isBlocked ? (
              <FormattedMessage id='empty_column.account_blocked' defaultMessage='You are blocked by @{accountUsername}.' values={{ accountUsername }} />
            ) : (
              <FormattedMessage id='empty_column.account_unavailable' defaultMessage='Profile unavailable' />
            )}
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <StatusList
      scrollKey='account_timeline'
      statusIds={statusIds}
      featuredStatusIds={showPins ? featuredStatusIds : undefined}
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      emptyMessage={<FormattedMessage id='empty_column.account_timeline' defaultMessage='No posts here!' />}
    />
  );
};

export default AccountTimeline;
