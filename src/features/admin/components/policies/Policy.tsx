import CloseIcon from '@tabler/icons/outline/x.svg';
import { FC } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Card, CardHeader, CardBody } from 'soapbox/components/ui/card.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import { PolicySpecItem, PolicyItem, PolicyState, PolicyAction } from 'soapbox/utils/policies.ts';

import { PolicyFields } from './PolicyFields.tsx';

const messages = defineMessages({
  removePolicy: { id: 'admin.policies.remove_policy', defaultMessage: 'Remove policy' },
});

export const Policy: FC<{
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
            aria-label={intl.formatMessage(messages.removePolicy)}
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
