import HStack from 'soapbox/components/ui/hstack.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Streamfield, { StreamfieldComponent } from 'soapbox/components/ui/streamfield.tsx';

interface IEditableList<T> {
  items: T[];
  setItems: (items: T[]) => void;
}

const MintField: StreamfieldComponent<string> = ({ value, onChange }) => {
  return (
    <HStack space={2} grow>
      <Input
        type='text'
        outerClassName='w-full grow'
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </HStack>
  );
};

const MintEditor: React.FC<IEditableList<string>> = ({ items, setItems }) => {
  const handleAdd = () => setItems([...items, '' ]);
  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  return <Streamfield values={items} onChange={setItems} component={MintField} onAddItem={handleAdd} onRemoveItem={handleRemove} />;
};

const RelayField: StreamfieldComponent<string> = ({ value, onChange }) => {
  return (
    <HStack space={2} grow>
      <Input
        type='text'
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