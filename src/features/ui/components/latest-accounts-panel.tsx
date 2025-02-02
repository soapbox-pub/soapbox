import xIcon from '@tabler/icons/outline/x.svg';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Text from 'soapbox/components/ui/text.tsx';
import Widget from 'soapbox/components/ui/widget.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import PlaceholderSidebarSuggestions from 'soapbox/features/placeholder/components/placeholder-sidebar-suggestions.tsx';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { useDismissSuggestion, useSuggestions } from 'soapbox/queries/suggestions.ts';

import type { Account as AccountEntity } from 'soapbox/types/entities.ts';

const messages = defineMessages({
  dismissSuggestion: { id: 'suggestions.dismiss', defaultMessage: 'Dismiss suggestion' },
});

interface ILatestAccountsPanel {
  limit: number;
}

const LatestAccountsPanel: React.FC<ILatestAccountsPanel> = ({ limit }) => {
  const intl = useIntl();

  const { account } = useOwnAccount();
  const { data: suggestions, isFetching } = useSuggestions({ local: true });
  const dismissSuggestion = useDismissSuggestion();

  const suggestionsToRender = suggestions.slice(0, limit);

  const handleDismiss = (account: AccountEntity) => {
    dismissSuggestion.mutate(account.id);
  };

  if (!isFetching && !suggestions.length) {
    return null;
  }

  return (
    <Widget
      title={<FormattedMessage id='latest_accounts.title' defaultMessage='Latest Accounts' />}
      action={
        <Link className='text-right' to='/suggestions/local'>
          <Text tag='span' theme='primary' size='sm' className='hover:underline'>
            <FormattedMessage id='feed_suggestions.view_all' defaultMessage='View all' />
          </Text>
        </Link>
      }
    >
      {isFetching ? (
        <PlaceholderSidebarSuggestions limit={limit} />
      ) : (
        suggestionsToRender.map((suggestion: any) => (
          <AccountContainer
            key={suggestion.account}
            // @ts-ignore: TS thinks `id` is passed to <Account>, but it isn't
            id={suggestion.account}
            actionIcon={xIcon}
            actionTitle={intl.formatMessage(messages.dismissSuggestion)}
            onActionClick={account ? handleDismiss : undefined}
          />
        ))
      )}
    </Widget>
  );
};

export default LatestAccountsPanel;
