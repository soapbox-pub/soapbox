import { FC, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useModerationPolicies } from 'soapbox/api/hooks/admin/index.ts';
import { PolicyItem } from 'soapbox/api/hooks/admin/useModerationPolicies.ts';
import FuzzySearchInput from 'soapbox/components/fuzzy-search-input.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';

const messages = defineMessages({
  heading: { id: 'column.admin.policies', defaultMessage: 'Manage Policies' },
  searchPlaceholder: { id: 'admin.policies.search_placeholder', defaultMessage: 'What do you want to do?' },
});

const PolicyManager: FC = () => {
  const intl = useIntl();
  const { allPolicies = [], isLoading } = useModerationPolicies();
  const [, setSearchValue] = useState('');

  const handleSelection = (policy: PolicyItem | null) => {
    if (policy) {
      setSearchValue(policy.name);
    } else {
      setSearchValue('');
    }
  };

  const Suggestion: FC<{ item: PolicyItem }> = ({ item }) => {
    return (<Stack>
      <div><strong className='text-lg'>{item.name}</strong></div>
      <div>{item.description}</div>
    </Stack>);
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='p-4'>
        {isLoading ? (
          <div className='flex justify-center p-4'><Spinner /></div>
        ) : (
          <FuzzySearchInput<PolicyItem>
            data={allPolicies}
            keys={['name', 'description']}
            onSelection={handleSelection}
            displayKey='name'
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            className='w-full'
            renderSuggestion={Suggestion}
          />
        )}
      </div>

      <div className='border-t border-gray-200 p-4 dark:border-gray-700'>
        {/* Render filtered policies based on searchValue */}
      </div>
    </Column>
  );
};

export default PolicyManager;
