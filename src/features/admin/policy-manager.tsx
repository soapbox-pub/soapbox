import { isEqual } from 'es-toolkit';
import { FC, useEffect, useMemo, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useModerationPolicies } from 'soapbox/api/hooks/admin/index.ts';
import FuzzySearchInput from 'soapbox/components/fuzzy-search-input.tsx';
import { Button } from 'soapbox/components/ui/button.tsx';
import { Card } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { Policy } from 'soapbox/features/admin/components/policies/Policy.tsx';
import { usePolicyReducer } from 'soapbox/features/admin/hooks/usePolicyReducer.ts';
import toast from 'soapbox/toast.tsx';
import { PolicyItem, PolicyParam, PolicyParams, PolicySpec, PolicySpecItem } from 'soapbox/utils/policies.ts';

const messages = defineMessages({
  heading: { id: 'admin.policies.heading', defaultMessage: 'Manage Policies' },
  searchPlaceholder: { id: 'admin.policies.search_placeholder', defaultMessage: 'What do you want to do?' },
  policyModeError: { id: 'admin.policies.policy_mode_error', defaultMessage: 'The Ditto custom policy is enabled. Unset the DITTO_CUSTOM_POLICY environment variable to use the Policy UI.' },
  noPolicyConfigured: { id: 'admin.policies.no_policies_configured', defaultMessage: 'No policies configured! Use the search bar above to get started.' },
  addValue: { id: 'admin.policies.add_value', defaultMessage: 'Add' },
  removeValue: { id: 'admin.policies.remove_value', defaultMessage: 'Remove value' },
});

const PolicySuggestion: FC<{ item: PolicyItem }> = ({ item }) => {
  return (
    <Stack className='p-2'>
      <div><strong>{item.name}</strong></div>
      <div>{item.description}</div>
    </Stack>
  );
};

const PolicyManager: FC = () => {
  const intl = useIntl();
  const { allPolicies = [], isLoading, storedPolicies, updatePolicy, isUpdating } = useModerationPolicies();
  // get the current set of policies out of the API response
  const initialPolicies = storedPolicies?.spec?.policies ?? [];

  // initialFields is used to set up the reducer. stores the initial value of
  // all the fields from the current policy and falls back to the default if
  // the value isn't present.
  const initialFields = useMemo(() => {
    const policyMap = allPolicies.reduce((acc, policy) => {
      acc[policy.internalName] = policy;
      return acc;
    }, {} as Record<string, PolicyItem>);

    const fields: Record<string, PolicyParam> = {};

    for (const policy of initialPolicies) {
      const item = policyMap[policy.name];
      if (!item) continue;

      for (const [key, val] of Object.entries(item.parameters)) {
        const fieldKey = `${policy.name}.${key}`;
        if (policy.params?.[key] !== undefined) {
          fields[fieldKey] = policy.params[key];
        } else if (val.type.startsWith('multi_')) {
          fields[fieldKey] = [];
        } else {
          fields[fieldKey] = val.default ?? '';
        }
      }
    }

    return fields;
  }, [allPolicies, initialPolicies]); // Changed from storedPolicies to initialPolicies

  const [state, dispatch] = usePolicyReducer(allPolicies, initialPolicies, initialFields);

  // Initialize fields when storedPolicies loads
  const prevInitialFields = useRef<Record<string, PolicyParam>>();

  useEffect(() => {
    if (initialFields && !isEqual(prevInitialFields.current, initialFields)) {
      dispatch({ type: 'INITIALIZE_FIELDS', fields: initialFields });
      prevInitialFields.current = initialFields;
    }
  }, [initialFields]);

  const handleSelection = (policy: PolicyItem | null, clear: () => void) => {
    if (policy) {
      const alreadyExists = state.policies.some(p => p.name === policy.internalName);

      if (!alreadyExists) {
        const newPolicy: PolicySpecItem = { name: policy.internalName, params: {} };
        dispatch({ type: 'ADD_POLICY', policy: newPolicy });
      } else {
        toast.error('Policy already exists!');
      }
    }
    clear(); // clear the text field
  };

  if (isLoading) return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Spinner size={40} />
    </Column>
  );

  const renderPolicies = () => {
    if (storedPolicies?.mode === 'script') {
      return (
        <Card size='lg'>
          {intl.formatMessage(messages.policyModeError)}
        </Card>
      );
    } else if (state.policies.length === 0) {
      return (
        <Card size='lg'>
          {intl.formatMessage(messages.noPolicyConfigured)}
        </Card>
      );
    }

    return (
      <Stack>
        {state.policies.map(policy => (
          <Policy
            intl={intl}
            key={policy.name}
            policy={policy}
            registry={allPolicies}
            state={state}
            dispatch={dispatch}
          />
        ))}
      </Stack>
    );
  };

  const handleSave = async () => {
    const policyParams = Object.entries(state.fields)
      .map(([key, value]) => {
        const [policy, paramName] = key.split('.');
        return { policy, paramName, value };
      });

    const policies: Record<string, PolicyParams> = {};

    for (const param of policyParams) {
      policies[param.policy] ??= {};
      policies[param.policy][param.paramName] = param.value;
    }

    const policySpec: PolicySpec = {
      policies: Object.entries(policies).map(([policyName, params]) => ({ params, name: policyName })),
    };

    updatePolicy(policySpec, {
      onError(error) {
        toast.error(`Error updating policies: ${error.name}`);
      },
      onSuccess() {
        toast.success('Saved successfully.');
      },
    });
  };

  return (
    <Column className='mb-8' label={intl.formatMessage(messages.heading)}>
      <div className='p-4'>
        <FuzzySearchInput<PolicyItem>
          data={allPolicies}
          keys={['name', 'description']}
          onSelection={handleSelection}
          displayKey='name'
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          className='w-full'
          renderSuggestion={PolicySuggestion}
        />
      </div>
      {renderPolicies()}
      <div className='m-2 flex w-full flex-row items-center justify-end px-6'>
        <Button onClick={handleSave} text='Save' theme='primary' />
        <div className={isUpdating ? 'ml-2' : ''}>{isUpdating && <Spinner size={20} withText={false} />}</div>
      </div>
    </Column>
  );
};

export default PolicyManager;
