import React from 'react';

import { HStack, Input } from 'soapbox/components/ui';
import Streamfield, { StreamfieldComponent } from 'soapbox/components/ui/streamfield/streamfield';
import { useInstance } from 'soapbox/hooks';

interface IRelayEditor {
  relays: RelayData[];
  setRelays: (relays: RelayData[]) => void;
}

const RelayEditor: React.FC<IRelayEditor> = ({ relays, setRelays }) => {
  const handleAddRelay = (): void => {
    setRelays([...relays, { url: '' }]);
  };

  const handleRemoveRelay = (i: number): void => {
    const newRelays = [...relays];
    newRelays.splice(i, 1);
    setRelays(newRelays);
  };

  return (
    <Streamfield
      values={relays}
      onChange={setRelays}
      component={RelayField}
      onAddItem={handleAddRelay}
      onRemoveItem={handleRemoveRelay}
    />
  );
};

interface RelayData {
  url: string;
  marker?: 'read' | 'write';
}

const RelayField: StreamfieldComponent<RelayData> = ({ value, onChange }) => {
  const instance = useInstance();

  const handleChange = (key: string): React.ChangeEventHandler<HTMLInputElement> => {
    return e => {
      onChange({ ...value, [key]: e.currentTarget.value });
    };
  };

  return (
    <HStack space={2} grow>
      <Input
        type='text'
        outerClassName='w-2/5 grow'
        value={value.url}
        onChange={handleChange('url')}
        placeholder={instance.nostr?.relay ?? `wss://${instance.domain}/relay`}
      />
    </HStack>
  );
};

export default RelayEditor;

export type { RelayData };