import CloseIcon from '@tabler/icons/outline/x.svg';
import { FC, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { FieldItem, PolicyAction, PolicyState, stringifyDefault } from 'soapbox/utils/policies.ts';

const messages = defineMessages({
  removeValue: { id: 'admin.policies.remove_value', defaultMessage: 'Remove value' },
  addValue: { id: 'admin.policies.add_value', defaultMessage: 'Add' },
});

const MultiValueBadge: FC<{
  value: string | number;
  onRemove: () => void;
  intl: ReturnType<typeof useIntl>;
}> = ({ value, onRemove, intl }) => {
  return (
    <div className='mb-2 mr-2 inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-gray-800'>
      <span className='mr-1 max-w-28 overflow-hidden text-ellipsis' title={String(value)}>{value}</span>
      <button onClick={onRemove} className='text-gray-600 hover:text-gray-800' aria-label={intl.formatMessage(messages.removeValue)}>
        <Icon src={CloseIcon} className='size-4' />
      </button>
    </div>
  );
};


const getInputPlaceholder = (schema: FieldItem) => {
  if (schema.default) return `Default: ${stringifyDefault(schema.default)}`;
  if (schema.optional) return '(Optional)';
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

export const PolicyFields: FC<{
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

    // Convert to number for multi_number fields
    const processedValue = schema.type === 'multi_number'
      ? Number(inputValue)
      : inputValue;

    // Check for NaN when converting to number
    if (schema.type === 'multi_number' && isNaN(processedValue as number)) {
      // Show error or return
      return;
    }

    if (!currentValue.includes(processedValue)) {
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
              intl={intl}
              value={v}
              onRemove={() => handleRemoveMultiValue(v)}
            />
          ))}
        </div>
      </Stack>
    </Stack>
  );
};
