import { defineMessages, useIntl } from 'react-intl';

import { useModerationPolicies } from 'soapbox/api/hooks/admin/index.ts';
import { Column } from 'soapbox/components/ui/column.tsx';

const messages = defineMessages({
  heading: { id: 'column.admin.policies', defaultMessage: 'Manage Policies' },
  emptyMessage: { id: 'admin.moderation_log.empty_message', defaultMessage: 'You have not performed any moderation actions yet. When you do, a history will be shown here.' },
});

const PolicyManager = () => {
  const intl = useIntl();
  const { allPolicies /* currentPolicy, isLoading, updatePolicy, isUpdating */ } = useModerationPolicies();
  console.warn(allPolicies);
  return (
    <Column label={intl.formatMessage(messages.heading)} />
  );
};


export default PolicyManager;
