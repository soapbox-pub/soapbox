import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { useAdminAccounts } from 'soapbox/api/hooks/admin/useAdminAccounts';
import Account from 'soapbox/components/account';
import { Widget } from 'soapbox/components/ui';

const messages = defineMessages({
  title: { id: 'admin.latest_accounts_panel.title', defaultMessage: 'Latest Accounts' },
});

interface ILatestAccountsPanel {
  limit?: number;
}

const LatestAccountsPanel: React.FC<ILatestAccountsPanel> = ({ limit = 5 }) => {
  const intl = useIntl();
  const history = useHistory();

  const { accounts } = useAdminAccounts({
    local: true,
    active: true,
    pending: false,
    disabled: false,
    silenced: false,
    suspended: false,
  }, limit);

  const handleAction = () => {
    history.push('/soapbox/admin/users');
  };

  return (
    <Widget
      title={intl.formatMessage(messages.title)}
      onActionClick={handleAction}
    >
      {accounts.slice(0, limit).map(account => (
        <Account key={account.id} account={account} withRelationship={false} withDate />
      ))}
    </Widget>
  );
};

export default LatestAccountsPanel;
