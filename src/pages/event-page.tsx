import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Column } from 'soapbox/components/ui/column.tsx';
import Layout from 'soapbox/components/ui/layout.tsx';
import Tabs from 'soapbox/components/ui/tabs.tsx';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status.tsx';
import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import {
  EventHeader,
  CtaBanner,
  SignUpPanel,
  TrendsPanel,
  WhoToFollowPanel,
} from 'soapbox/features/ui/util/async-components.ts';
import { useAppSelector, useFeatures } from 'soapbox/hooks/index.ts';
import { makeGetStatus } from 'soapbox/selectors/index.ts';

const getStatus = makeGetStatus();

interface IEventPage {
  params?: {
    statusId?: string;
  };
  children: React.ReactNode;
}

const EventPage: React.FC<IEventPage> = ({ params, children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  const history = useHistory();
  const statusId = params?.statusId!;

  const status = useAppSelector(state => getStatus(state, { id: statusId }) || undefined);

  const event = status?.event;

  if (status && !event) {
    history.push(`/@${status.getIn(['account', 'acct'])}/posts/${status.id}`);
    return (
      <PlaceholderStatus />
    );
  }

  const pathname = history.location.pathname;
  const activeItem = pathname.endsWith('/discussion') ? 'discussion' : 'info';

  const tabs = status ? [
    {
      text: <FormattedMessage id='event.information' defaultMessage='Information' />,
      to: `/@${status.getIn(['account', 'acct'])}/events/${status.id}`,
      name: 'info',
    },
    {
      text: <FormattedMessage id='event.discussion' defaultMessage='Discussion' />,
      to: `/@${status.getIn(['account', 'acct'])}/events/${status.id}/discussion`,
      name: 'discussion',
    },
  ] : [];

  const showTabs = !['/participations', 'participation_requests'].some(path => pathname.endsWith(path));

  return (
    <>
      <Layout.Main>
        <Column label={event?.name} withHeader={false}>
          <div className='space-y-4'>
            <EventHeader status={status} />

            {status && showTabs && (
              <Tabs key={`event-tabs-${status.id}`} items={tabs} activeItem={activeItem} />
            )}

            {children}
          </div>
        </Column>

        {!me && (
          <CtaBanner />
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export default EventPage;
