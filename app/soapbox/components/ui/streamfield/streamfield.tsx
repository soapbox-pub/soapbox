import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import Button from '../button/button';
import HStack from '../hstack/hstack';
import IconButton from '../icon-button/icon-button';
import Stack from '../stack/stack';
import Text from '../text/text';

const messages = defineMessages({
  add: { id: 'streamfield.add', defaultMessage: 'Add' },
  remove: { id: 'streamfield.remove', defaultMessage: 'Remove' },
});

/** Type of the inner Streamfield input component. */
export type StreamfieldComponent<T> = React.ComponentType<{
  value: T
  onChange: (value: T) => void
  autoFocus: boolean
}>;

interface IStreamfield {
  /** Array of values for the streamfield. */
  values: any[]
  /** Input label message. */
  label?: React.ReactNode
  /** Input hint message. */
  hint?: React.ReactNode
  /** Callback to add an item. */
  onAddItem?: () => void
  /** Callback to remove an item by index. */
  onRemoveItem?: (i: number) => void
  /** Callback when values are changed. */
  onChange: (values: any[]) => void
  /** Input to render for each value. */
  component: StreamfieldComponent<any>
  /** Minimum number of allowed inputs. */
  minItems?: number
  /** Maximum number of allowed inputs. */
  maxItems?: number
}

/** List of inputs that can be added or removed. */
const Streamfield: React.FC<IStreamfield> = ({
  values,
  label,
  hint,
  onAddItem,
  onRemoveItem,
  onChange,
  component: Component,
  maxItems = Infinity,
  minItems = 0,
}) => {
  const intl = useIntl();

  const handleChange = (i: number) => {
    return (value: any) => {
      const newData = [...values];
      newData[i] = value;
      onChange(newData);
    };
  };

  return (
    <Stack space={4}>
      <Stack>
        {label && <Text size='sm' weight='medium'>{label}</Text>}
        {hint && <Text size='xs' theme='muted'>{hint}</Text>}
      </Stack>

      {(values.length > 0) && (
        <Stack space={1}>
          {values.map((value, i) => value?._destroy ? null : (
            <HStack space={2} alignItems='center'>
              <Component
                key={i}
                onChange={handleChange(i)}
                value={value}
                autoFocus={i > 0}
              />
              {values.length > minItems && onRemoveItem && (
                <IconButton
                  iconClassName='h-4 w-4'
                  className='bg-transparent text-gray-600 hover:text-gray-600'
                  src={require('@tabler/icons/x.svg')}
                  onClick={() => onRemoveItem(i)}
                  title={intl.formatMessage(messages.remove)}
                />
              )}
            </HStack>
          ))}
        </Stack>
      )}

      {(onAddItem && (values.length < maxItems)) && (
        <Button
          onClick={onAddItem}
          theme='secondary'
          block
        >
          {intl.formatMessage(messages.add)}
        </Button>
      )}
    </Stack>
  );
};

export default Streamfield;
