import { FC, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useModerationPolicies } from 'soapbox/api/hooks/admin/index.ts';
import { FieldItem, PolicyItem, PolicyParam, PolicyParams, PolicySpec, PolicySpecItem } from 'soapbox/api/hooks/admin/useModerationPolicies.ts';
import FuzzySearchInput from 'soapbox/components/fuzzy-search-input.tsx';
import { Card, CardBody, CardHeader } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';

const messages = defineMessages({
  heading: { id: 'column.admin.policies', defaultMessage: 'Manage Policies' },
  searchPlaceholder: { id: 'admin.policies.search_placeholder', defaultMessage: 'What do you want to do?' },
  policyModeError: { id: 'admin.policies.policy_mode_error', defaultMessage: 'The Ditto custom policy is enabled. Unset the <code>DITTO_CUSTOM_POLICY</code> environment variable to use the Policy UI.' },
  noPolicyConfigured: { id: 'admin.policies.no_policies_configured', defaultMessage: 'No policies configured! Use the search bar above to get started.' },
});

const Suggestion: FC<{ item: PolicyItem }> = ({ item }) => {
  return (<Stack>
    <div><strong className='text-lg'>{item.name}</strong></div>
    <div>{item.description}</div>
  </Stack>);
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

class FormManager {

  fields: Map<string, PolicyParam> = new Map();
  policies: PolicySpecItem[];
  policyMap: Record<string, PolicyItem> = {};
  forceUpdate: () => void;

  constructor(
    allPolicies: PolicyItem[],
    currentPolicy?: PolicySpec,
    forceUpdate?: () => void,
  ) {
    this.forceUpdate = forceUpdate ?? (() => { });
    this.policies = currentPolicy?.policies ?? [];

    allPolicies.forEach(policy => {
      this.policyMap[policy.internalName] = policy;
    });

    this.initializeFields();
  }

  initializeFields() {
    for (const policy of this.policies) {
      const item = this.policyMap[policy.name];
      if (!item) continue;

      for (const [key, val] of Object.entries(item.parameters)) {
        const fieldKey = `${policy.name}.${key}`;
        if (policy.params?.[key] !== undefined) {
          this.fields.set(fieldKey, policy.params[key]);
        } else if (val.type.startsWith('multi_')) {
          this.fields.set(fieldKey, []);
        } else {
          this.fields.set(fieldKey, val.default ?? '');
        }
      }
    }
  }

  updateField(policyName: string, fieldName: string, value: PolicyParam) {
    const fieldKey = `${policyName}.${fieldName}`;
    this.fields.set(fieldKey, value);
    this.forceUpdate();
  }

  addMultiValue(policyName: string, fieldName: string, value: string | number) {
    const fieldKey = `${policyName}.${fieldName}`;
    const current = this.fields.get(fieldKey) as (string | number)[] || [];
    this.fields.set(fieldKey, [...current, value]);
    this.forceUpdate();
  }

  removeMultiValue(policyName: string, fieldName: string, value: string | number) {
    const fieldKey = `${policyName}.${fieldName}`;
    const current = this.fields.get(fieldKey) as (string | number)[] || [];
    this.fields.set(fieldKey, current.filter(v => v !== value));
    this.forceUpdate();
  }

  removePolicy(policyName: string) {
    this.policies = this.policies.filter(p => p.name !== policyName);
    [...this.fields.keys()]
      .filter(key => key.startsWith(`${policyName}.`))
      .forEach(key => this.fields.delete(key));
    this.forceUpdate();
  }

  getFieldValue(policyName: string, fieldName: string): PolicyParam {
    return this.fields.get(`${policyName}.${fieldName}`) ?? '';
  }

}

const stringifyDefault = (value: any) => {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }
  if (typeof value in ['number', 'string', 'boolean']) return value.toString();
  return '';
};

const getInputPlaceholder = (schema: FieldItem) => {
  if (schema.default) return `Default: ${stringifyDefault(schema.default)}`;
  if (schema.optional) return '(Optional)';
};

const ItemValue: FC<{ value: string }> = ({ value }) => {
  return (
    <span>{value}</span>
  );
};

const PolicyFields: FC<{ schema: FieldItem; name: string; value: PolicyParams }> = ({ schema, name, value }) => {
  if (!value) value = schema.default;
  return (<Stack>
    <div>{schema.description}</div>
    <div>
      {
        name === 'filters' ? <textarea />
          : <Input
            className='my-2'
            type={getInputType(schema.type)}
            placeholder={getInputPlaceholder(schema)}
          />
      }
    </div>
    {Array.isArray(value) && value.map(v => <ItemValue value={stringifyDefault(v)} />)}
  </Stack>);
};

const Policy: FC<{ policy: PolicySpecItem; registry: PolicyItem[] }> = ({ policy: { name, params = {} }, registry }) => {
  const def = registry.find(item => item.internalName === name);
  if (!def) return null;
  return (
    <Card rounded className='mx-4 my-1 border-2 border-solid border-gray-700'>
      <CardHeader className={Object.keys(def.parameters).length ? 'mb-1' : ''}><strong>{def.name}</strong></CardHeader>
      <CardBody>
        {Object.entries(def.parameters).map(item => <PolicyFields name={item[0]} schema={item[1]} value={params} />)}
      </CardBody>
    </Card>
  );
};

const PolicyManager: FC = () => {
  const intl = useIntl();
  const { allPolicies = [], isLoading, currentPolicy } = useModerationPolicies();
  const [policyList, setPolicyList] = useState<PolicySpecItem[]>(currentPolicy?.spec.policies || []);
  useEffect(() => setPolicyList(currentPolicy?.spec.policies || []), [currentPolicy]); // Runs whenever currentPolicy changes

  const [, forceUpdate] = useState(0);
  const formManager = new FormManager(allPolicies, currentPolicy?.spec, () => forceUpdate(n => n + 1));
  console.log(formManager);

  const handleSelection = (policy: PolicyItem | null) => {

  };

  if (isLoading) return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Spinner size={40} />
    </Column>
  );

  const renderPolicies = () => {
    if (currentPolicy?.mode === 'script') {
      return (<Card size='lg'>
        {intl.formatMessage(messages.policyModeError)}
      </Card>);
    } else if (currentPolicy?.spec.policies.length === 0) {
      return (<Card size='lg'>
        {intl.formatMessage(messages.noPolicyConfigured)}
      </Card>);
    }

    return (<Stack>
      {policyList.map(policy => <Policy registry={allPolicies} policy={policy} />)}
    </Stack>);
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>

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
    </Column>
  );
};

export default PolicyManager;
