import { isEqual } from 'es-toolkit';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useModerationPolicies } from 'soapbox/api/hooks/admin/index.ts';
import FuzzySearchInput from 'soapbox/components/fuzzy-search-input.tsx';
import { Button } from 'soapbox/components/ui/button.tsx';
import { Card } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { Policy } from 'soapbox/features/admin/components/policies/Policy.tsx';
import { usePolicyReducer } from 'soapbox/features/admin/hooks/usePolicyReducer.ts';
import toast from 'soapbox/toast.tsx';
import { PolicyItem, PolicyParam, PolicyParams, PolicySpec, PolicySpecItem } from 'soapbox/utils/policies.ts';

const messages = defineMessages({
  heading: { id: 'admin.policies.heading', defaultMessage: 'Manage Policies' },
  searchPlaceholder: { id: 'admin.policies.search_placeholder', defaultMessage: 'What do you want to do?' },
  noPolicyConfigured: { id: 'admin.policies.no_policies_configured', defaultMessage: 'No policies configured! Use the search bar above to get started.' },
  removeValue: { id: 'admin.policies.remove_value', defaultMessage: 'Remove value' },
  welcomeTitle: { id: 'admin.policies.welcome.title', defaultMessage: 'Welcome to Policy Manager' },
  welcomeGetStarted: { id: 'admin.policies.welcome.get_started', defaultMessage: 'Get Started' },
  helpTitle: { id: 'admin.policies.help.title', defaultMessage: 'Help' },
  helpButton: { id: 'admin.policies.help.button', defaultMessage: 'Help' },
  welcomeDescription: { id: 'admin.policies.help.description', defaultMessage: 'Policy Manager allows you to configure moderation and content policies for your instance.' },
  welcomeStep1: { id: 'admin.policies.help.step1', defaultMessage: '1. Use the search bar to find policies you want to add' },
  welcomeStep2: { id: 'admin.policies.help.step2', defaultMessage: '2. Configure each policy with your desired settings' },
  welcomeStep3: { id: 'admin.policies.help.step3', defaultMessage: '3. Click Save to apply the changes' },
  welcomeTip: { id: 'admin.policies.help.tip', defaultMessage: 'Tip: You can add multiple policies to create a comprehensive moderation strategy' },
  okay: { id: 'admin.policies.help.okay', defaultMessage: 'Okay' },
});

interface PolicyHelpModalProps {
  title: string;
  onClose: () => void;
  confirmText: string;
}

const PolicyHelpModal: FC<PolicyHelpModalProps> = ({ title, onClose, confirmText }) => {
  const intl = useIntl();

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-800/80'>
      <div className='w-auto max-w-2xl'>
        <Modal
          title={title}
          confirmationAction={onClose}
          confirmationText={confirmText}
          width='md'
        >
          <div className='space-y-4'>
            <p className='text-base'>
              {intl.formatMessage(messages.welcomeDescription)}
            </p>

            <div className='space-y-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
              <p className='font-semibold'>
                {intl.formatMessage(messages.welcomeStep1)}
              </p>
              <p className='font-semibold'>
                {intl.formatMessage(messages.welcomeStep2)}
              </p>
              <p className='font-semibold'>
                {intl.formatMessage(messages.welcomeStep3)}
              </p>
            </div>

            <div className='rounded-lg bg-blue-50 p-4 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'>
              {intl.formatMessage(messages.welcomeTip)}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

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
  const { allPolicies = [], isLoading, isFetched, storedPolicies, updatePolicy, isUpdating } = useModerationPolicies();
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
        localStorage.setItem('policy_manager_welcome_shown', 'true');
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
    if (state.policies.length === 0) {
      // Only show "no policies" message when we're certain data has loaded
      if (!isLoading && isFetched) {
        return (
          <Card size='lg'>
            {intl.formatMessage(messages.noPolicyConfigured)}
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
        <div className='mb-2 flex w-full justify-between'>
          <div className='grow'>
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
          <Button
            className='ml-2'
            onClick={showHelp}
            theme='secondary'
            text={intl.formatMessage(messages.helpButton)}
          />
        </div>
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
