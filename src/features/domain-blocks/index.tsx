import { debounce } from 'es-toolkit';
import { useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { fetchDomainBlocks, expandDomainBlocks } from 'soapbox/actions/domain-blocks.ts';
import Domain from 'soapbox/components/domain.tsx';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

const messages = defineMessages({
  heading: { id: 'column.domain_blocks', defaultMessage: 'Hidden domains' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
});

const handleLoadMore = debounce((dispatch) => {
  dispatch(expandDomainBlocks());
}, 300, { edges: ['leading'] });

const DomainBlocks: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const domains = useAppSelector((state) => state.domain_lists.blocks.items);
  const hasMore = useAppSelector((state) => !!state.domain_lists.blocks.next);

  useEffect(() => {
    dispatch(fetchDomainBlocks());
  }, []);

  if (!domains) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = <FormattedMessage id='empty_column.domain_blocks' defaultMessage='There are no hidden domains yet.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='domain_blocks'
        onLoadMore={() => handleLoadMore(dispatch)}
        hasMore={hasMore}
        emptyMessage={emptyMessage}
        listClassName='divide-y divide-gray-200 dark:divide-gray-800'
      >
        {domains.map((domain) =>
          <Domain key={domain} domain={domain} />,
        )}
      </ScrollableList>
    </Column>
  );
};

export default DomainBlocks;
