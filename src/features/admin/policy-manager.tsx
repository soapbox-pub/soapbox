import { isEqual } from 'es-toolkit';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useModerationPolicies } from 'soapbox/api/hooks/admin/index.ts';
import FuzzySearchInput from 'soapbox/components/fuzzy-search-input.tsx';
import { Button } from 'soapbox/components/ui/button.tsx';
import { Card } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { Policy } from 'soapbox/features/admin/components/policies/Policy.tsx';
import PolicyHelpModal from 'soapbox/features/admin/components/policies/PolicyHelpModal.tsx';
import { usePolicyReducer } from 'soapbox/features/admin/hooks/usePolicyReducer.ts';
import toast from 'soapbox/toast.tsx';
import { PolicyItem, PolicyParam, PolicyParams, PolicySpec, PolicySpecItem } from 'soapbox/utils/policies.ts';

const messages = defineMessages({
  heading: { id: 'admin.policies.heading', defaultMessage: 'Manage Policies' },
  searchPlaceholder: { id: 'admin.policies.search_placeholder', defaultMessage: 'What do you want to do?' },
  searchLabel: { id: 'admin.policies.search_label', defaultMessage: 'I want to...' },
  noPolicyConfigured: { id: 'admin.policies.no_policies_configured', defaultMessage: 'No policies configured! Use the search bar above to get started.' },
  removeValue: { id: 'admin.policies.remove_value', defaultMessage: 'Remove value' },
  welcomeTitle: { id: 'admin.policies.welcome.title', defaultMessage: 'Welcome to Policy Manager' },
  welcomeGetStarted: { id: 'admin.policies.welcome.get_started', defaultMessage: 'Get Started' },
  helpTitle: { id: 'admin.policies.help.title', defaultMessage: 'Help' },
  helpButton: { id: 'admin.policies.help.button', defaultMessage: 'Help' },
  okay: { id: 'admin.policies.help.okay', defaultMessage: 'Okay' },
  policyExists: { id: 'admin.policies.policy_exists', defaultMessage: 'Policy already exists!' },
  searchFieldLabel: { id: 'admin.policies.search_label', defaultMessage: 'Policy search field' },
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
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [isWelcomeDialog, setIsWelcomeDialog] = useState<boolean>(false);
  const {
    allPolicies = [],
    isLoading,
    isFetched,
    storedPolicies,
    updatePolicy,
    isUpdating,
    allPoliciesError,
    storedPoliciesError,
    allPoliciesIsError,
    storedPoliciesIsError,
  } = useModerationPolicies();
  // get the current set of policies out of the API response
  const initialPolicies = storedPolicies?.spec?.policies ?? [];

  // Generate dynamic placeholders from policy names
  const dynamicPlaceholders = useMemo(() => {
    if (allPolicies.length === 0) {
      return [messages.searchPlaceholder];
    }

    return [
      ...allPolicies.map(policy => policy.name.toLowerCase()),
    ];
  }, [allPolicies]);

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

  // Update policies when data is loaded
  useEffect(() => {
    if (isFetched && storedPolicies && initialPolicies.length > 0 && state.policies.length === 0) {
      // If policies are loaded from the server but not in our state, update the state
      initialPolicies.forEach(policy => {
        dispatch({ type: 'ADD_POLICY', policy });
      });
    }
  }, [isFetched, storedPolicies]);

  // Check if this is the first time loading using localStorage
  useEffect(() => {
    if (isFetched && !isLoading) {
      try {
        // Check if the user has seen the welcome dialog before
        const hasSeenWelcome = localStorage.getItem('soapbox:policies:welcome_shown');

        if (!hasSeenWelcome) {
          setShowHelpModal(true);
          setIsWelcomeDialog(true);
        }
      } catch (error) {
        // localStorage is unavailable, default to showing welcome
        setShowHelpModal(true);
        setIsWelcomeDialog(true);
      }
    }
  }, [isFetched, isLoading]);

  // Function to handle help dialog close
  const handleHelpClose = () => {
    setShowHelpModal(false);

    // If this was the welcome dialog, store that the user has seen it
    if (isWelcomeDialog) {
      setIsWelcomeDialog(false);
      try {
        localStorage.setItem('soapbox:policies:welcome_shown', 'true');
      } catch (error) {
        // Ignore localStorage errors
        console.warn('Could not store welcome dialog state in localStorage', error);
      }
    }
  };

  // Function to show help dialog
  const showHelp = () => {
    setIsWelcomeDialog(false); // Not the welcome dialog
    setShowHelpModal(true);
  };

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
        toast.error(intl.formatMessage(messages.policyExists));
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
    if (state.policies.length === 0) {
      // Only show "no policies" message when we're certain data has loaded
      if (!isLoading && isFetched) {
        return (
          <Card size='lg'>
            {intl.formatMessage(messages.noPolicyConfigured)}
          </Card>
        );
      } else if (allPoliciesIsError) {
        return (
          <Card size='lg'>
            {allPoliciesError?.message}
          </Card>
        );
      } else if (storedPoliciesIsError) {
        return (
          <Card size='lg'>
            {storedPoliciesError?.message}
          </Card>
        );
      } else {
        // If we're not loading but data isn't fetched yet, this prevents flashing "no policies"
        return (
          <Column label={intl.formatMessage(messages.heading)}>
            <Spinner size={40} />
          </Column>
        );
      }
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
        toast.error(`Error updating policies: ${error.message}`, {
          duration: Infinity,
        });
      },
      onSuccess() {
        toast.success('Saved successfully.');
      },
    });
  };

  return (
    <Column className='mb-8' label={intl.formatMessage(messages.heading)}>
      {showHelpModal && (
        <PolicyHelpModal
          title={isWelcomeDialog
            ? intl.formatMessage(messages.welcomeTitle)
            : intl.formatMessage(messages.helpTitle)
          }
          confirmText={isWelcomeDialog
            ? intl.formatMessage(messages.welcomeGetStarted)
            : intl.formatMessage(messages.okay)
          }
          onClose={handleHelpClose}
        />
      )}
      <div className='p-4'>
        <div className='mb-2 flex w-full items-center justify-between'>
          <div className='text-lg font-medium'>
            {intl.formatMessage(messages.searchLabel)}
          </div>
          <button
            onClick={showHelp}
            className='text-primary-600 hover:underline dark:text-accent-blue'
            aria-label={intl.formatMessage(messages.helpButton)}
          >
            {intl.formatMessage(messages.helpButton)}
          </button>
        </div>
        <FuzzySearchInput<PolicyItem>
          data={allPolicies}
          keys={['name', 'description']}
          onSelection={handleSelection}
          displayKey='name'
          placeholders={dynamicPlaceholders}
          ariaLabel={messages.searchFieldLabel}
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
