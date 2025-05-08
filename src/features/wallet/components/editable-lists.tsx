import React from 'react';

import HStack from 'soapbox/components/ui/hstack.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Streamfield, { StreamfieldComponent } from 'soapbox/components/ui/streamfield.tsx';

interface IEditableList<T> {
  items: T[];
  setItems: (items: T[]) => void;
}

const DEFAULT_MINT = 'https://mint.cubabitcoin.org';

const MintField: StreamfieldComponent<string> = ({ value, onChange, index = 0, values = [] }) => {
  const isFirst = index === 0;
  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    // Only apply default mint if it's the first field and all fields are still empty
    const allEmpty = values.every((v) => !v || v.trim() === '');
    if (isFirst && allEmpty) {
      setInputValue(DEFAULT_MINT);
      onChange(DEFAULT_MINT);
    } else if (value !== undefined) {
      setInputValue(value);
    }
  }, [value, index, values, isFirst, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <HStack space={2} grow>
      <Input
        type='text'
        placeholder='https://mint.example.com'
        outerClassName='w-full grow'
        value={inputValue}
        onChange={handleChange}
      />
    </HStack>
  );
};

// Add the index and values props to the Streamfield component in MintEditor
const MintEditor: React.FC<IEditableList<string>> = ({ items, setItems }) => {
  const handleAdd = () => setItems([...items, '' ]);
  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  return (
    <Streamfield
      values={items}
      onChange={setItems}
      component={(props) => <MintField {...props} index={props.index} values={items} />}
      onAddItem={handleAdd}
      onRemoveItem={handleRemove}
    />
  );
};

const RelayField: StreamfieldComponent<string> = ({ value, onChange }) => {
  return (
    <HStack space={2} grow>
      <Input
        type='text'
        placeholder='wss://example.com/relay'
        outerClassName='w-full grow'
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </HStack>
  );
};

const RelayEditor: React.FC<IEditableList<string>> = ({ items, setItems }) => {
  const handleAdd = () => setItems([...items, '']);
  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  return <Streamfield values={items} onChange={setItems} component={RelayField} onAddItem={handleAdd} onRemoveItem={handleRemove} />;
};

export { RelayEditor, MintEditor };
export type { IEditableList };