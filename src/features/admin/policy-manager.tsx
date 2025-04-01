import CloseIcon from '@tabler/icons/outline/x.svg';
import { isEqual } from 'es-toolkit';
import { FC, useEffect, useMemo, useReducer, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useModerationPolicies } from 'soapbox/api/hooks/admin/index.ts';
import { FieldItem, PolicyItem, PolicyParam, PolicyParams, PolicySpec, PolicySpecItem } from 'soapbox/api/hooks/admin/useModerationPolicies.ts';
import FuzzySearchInput from 'soapbox/components/fuzzy-search-input.tsx';
import { Button } from 'soapbox/components/ui/button.tsx';
import { Card, CardBody, CardHeader } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  heading: { id: 'column.admin.policies', defaultMessage: 'Manage Policies' },
  searchPlaceholder: { id: 'admin.policies.search_placeholder', defaultMessage: 'What do you want to do?' },
  policyModeError: { id: 'admin.policies.policy_mode_error', defaultMessage: 'The Ditto custom policy is enabled. Unset the <code>DITTO_CUSTOM_POLICY</code> environment variable to use the Policy UI.' },
  noPolicyConfigured: { id: 'admin.policies.no_policies_configured', defaultMessage: 'No policies configured! Use the search bar above to get started.' },
  addValue: { id: 'admin.policies.add_value', defaultMessage: 'Add' },
  removeValue: { id: 'admin.policies.remove_value', defaultMessage: 'Remove value' },
});

const Suggestion: FC<{ item: PolicyItem }> = ({ item }) => {
  return (
    <Stack className='p-2'>
      <div><strong>{item.name}</strong></div>
      <div>{item.description}</div>
    </Stack>
  );
};

const getInputType = (type: FieldItem['type']) => {
  switch (type) {
    case 'multi_number':
    case 'number':
      return 'number';
    case 'boolean':
      return 'checkbox';
  }
  return 'text';
};

// Define the state type
type PolicyState = {
  policies: PolicySpecItem[];
  fields: Record<string, PolicyParam>;
};

// Define action types
type PolicyAction =
  | { type: 'ADD_POLICY'; policy: PolicySpecItem }
  | { type: 'REMOVE_POLICY'; name: string }
  | { type: 'UPDATE_FIELD'; policyName: string; fieldName: string; value: PolicyParam }
  | { type: 'ADD_MULTI_VALUE'; policyName: string; fieldName: string; value: string | number }
  | { type: 'REMOVE_MULTI_VALUE'; policyName: string; fieldName: string; value: string | number }
  | { type: 'INITIALIZE_FIELDS'; fields: Record<string, PolicyParam> };

// Reducer function
const createPolicyReducer = (allPolicies: PolicyItem[]) => (state: PolicyState, action: PolicyAction): PolicyState => {
  switch (action.type) {
    case 'ADD_POLICY': {
      if (state.policies.some(p => p.name === action.policy.name)) {
        return state; // Don't add duplicate
      }

      // Initialize fields for the new policy
      const newFields = { ...state.fields };
      const policyDef = allPolicies.find(p => p.internalName === action.policy.name);

      if (policyDef) {
        Object.entries(policyDef.parameters).forEach(([fieldName, schema]) => {
          const fieldKey = `${action.policy.name}.${fieldName}`;
          if (!newFields[fieldKey]) {
            newFields[fieldKey] = schema.type.startsWith('multi_') ? [] : (schema.default ?? '');
          }
        });
      }

      return {
        ...state,
        policies: [action.policy, ...state.policies],
        fields: newFields,
      };
    }
    case 'REMOVE_POLICY':
      return {
        ...state,
        policies: state.policies.filter(policy => policy.name !== action.name),
      };
    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: {
          ...state.fields,
          [`${action.policyName}.${action.fieldName}`]: action.value,
        },
      };
    case 'ADD_MULTI_VALUE': {
      const fieldKey = `${action.policyName}.${action.fieldName}`;
      const current = (state.fields[fieldKey] as (string | number)[]) || [];
      return {
        ...state,
        fields: {
          ...state.fields,
          [fieldKey]: [...current, action.value],
        },
      };
    }
    case 'REMOVE_MULTI_VALUE': {
      const fieldKey = `${action.policyName}.${action.fieldName}`;
      const current = (state.fields[fieldKey] as (string | number)[]) || [];
      return {
        ...state,
        fields: {
          ...state.fields,
          [fieldKey]: current.filter(v => v !== action.value),
        },
      };
    }
    case 'INITIALIZE_FIELDS':
      return {
        ...state,
        fields: action.fields,
      };
    default:
      return state;
  }
};

const stringifyDefault = (value: any) => {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }
  if (['number', 'string', 'boolean'].includes(typeof value)) return value.toString();
  return '';
};

const getInputPlaceholder = (schema: FieldItem) => {
  if (schema.default) return `Default: ${stringifyDefault(schema.default)}`;
  if (schema.optional) return '(Optional)';
};

const MultiValueBadge: FC<{
  value: string | number;
  onRemove: () => void;
}> = ({ value, onRemove }) => {
  return (
    <div className='mb-2 mr-2 inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-gray-800'>
      <span className='mr-1'>{value}</span>
      <button onClick={onRemove} className='text-gray-500 hover:text-gray-700' aria-label={messages.removeValue.defaultMessage}>
        <Icon src={CloseIcon} className='size-3' />
      </button>
    </div>
  );
};

const PolicyFields: FC<{
  schema: FieldItem;
  name: string;
  policyName: string;
  state: PolicyState;
  dispatch: React.Dispatch<PolicyAction>;
  intl: ReturnType<typeof useIntl>;
}> = ({ schema, name, policyName, state, dispatch, intl }) => {
  const value = state.fields[`${policyName}.${name}`];
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = schema.type === 'number' ? Number(e.target.value) : e.target.value;
    dispatch({ type: 'UPDATE_FIELD', policyName, fieldName: name, value: newValue });
  };

  const handleAddMultiValue = () => {
    const inputValue = inputRef.current?.value;
    if (!inputValue?.trim()) return;

    const currentValue = Array.isArray(value) ? value : [];

    if (!currentValue.includes(inputValue)) {
      dispatch({ type: 'ADD_MULTI_VALUE', policyName, fieldName: name, value: inputValue });
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  const handleRemoveMultiValue = (valueToRemove: string | number) => {
    dispatch({ type: 'REMOVE_MULTI_VALUE', policyName, fieldName: name, value: valueToRemove });
  };

  if (!schema.type.startsWith('multi_')) {
    return (
      <Stack space={2}>
        <div className='mt-2'>{schema.description}</div>
        {
          schema.type === 'boolean' ?
            <input type='checkbox' checked={!!value} /> :
            <Input
              type={getInputType(schema.type)}
              value={value as string | number}
              onChange={handleChange}
              placeholder={getInputPlaceholder(schema)}
            />
        }
      </Stack>
    );
  }

  return (
    <Stack space={2}>
      <div className='mt-2'>{schema.description}</div>
      <Stack space={2}>
        <div className='flex items-center'>
          <Input
            type={getInputType(schema.type)}
            placeholder={getInputPlaceholder(schema)}
            className='mr-2 flex-1'
            ref={inputRef}
          />
          <Button className='m-2' onClick={handleAddMultiValue}>
            {intl.formatMessage(messages.addValue)}
          </Button>
        </div>
        <div className='flex flex-wrap'>
          {((value || []) as (string | number)[]).map((v) => (
            <MultiValueBadge
              key={v}
              value={v}
              onRemove={() => handleRemoveMultiValue(v)}
            />
          ))}
        </div>
      </Stack>
    </Stack>
  );
};

const Policy: FC<{
  policy: PolicySpecItem;
  registry: PolicyItem[];
  state: PolicyState;
  dispatch: React.Dispatch<PolicyAction>;
  intl: ReturnType<typeof useIntl>;
}> = ({ policy, registry, state, dispatch, intl }) => {
  const def = registry.find(item => item.internalName === policy.name);
  if (!def) return null;

  const handleRemovePolicy = () => {
    dispatch({ type: 'REMOVE_POLICY', name: policy.name });
  };

  return (
    <Card rounded className='relative mx-4 my-1 border-2 border-solid border-gray-700'>
      <CardHeader className={Object.keys(def.parameters).length ? 'mb-1' : ''}>
        <div className='flex items-center justify-between'>
          <strong>{def.name}</strong>
          <button
            onClick={handleRemovePolicy}
            className='ml-2 text-gray-500 hover:text-gray-100'
          >
            <Icon src={CloseIcon} className='size-4' />
          </button>
        </div>
      </CardHeader>
      <CardBody>
        {Object.entries(def.parameters).map(([fieldName, schema]) => (
          <PolicyFields
            intl={intl}
            key={fieldName}
            name={fieldName}
            schema={schema}
            policyName={policy.name}
            state={state}
            dispatch={dispatch}
          />
        ))}
      </CardBody>
    </Card>
  );
};

const PolicyManager: FC = () => {
  const intl = useIntl();
  const { allPolicies = [], isLoading, storedPolicies } = useModerationPolicies();
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

  const [state, dispatch] = useReducer(createPolicyReducer(allPolicies),
    { policies: initialPolicies, fields: initialFields });

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

    console.log({
      generated: policySpec.policies,
      actual: state.policies,
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
          renderSuggestion={Suggestion}
        />
      </div>
      {renderPolicies()}
      <div className='m-2 flex w-full flex-row justify-end px-6'>
        <Button onClick={handleSave} text='Save' theme='primary' />
      </div>
    </Column>
  );
};

export default PolicyManager;
