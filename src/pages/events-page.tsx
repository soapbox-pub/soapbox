import Layout from 'soapbox/components/ui/layout.tsx';
import LinkFooter from 'soapbox/features/ui/components/link-footer.tsx';
import {
  WhoToFollowPanel,
  TrendsPanel,
  NewEventPanel,
} from 'soapbox/features/ui/util/async-components.ts';
import { useFeatures } from 'soapbox/hooks/index.ts';

interface IEventsPage {
  children: React.ReactNode;
}

/** Page to display events list. */
const EventsPage: React.FC<IEventsPage> = ({ children }) => {
  const features = useFeatures();

  return (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

      <Layout.Aside>
        <NewEventPanel />
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

export default EventsPage;
