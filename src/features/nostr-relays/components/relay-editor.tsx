import { FormattedMessage } from 'react-intl';

import HStack from 'soapbox/components/ui/hstack.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Select from 'soapbox/components/ui/select.tsx';
import Streamfield, { StreamfieldComponent } from 'soapbox/components/ui/streamfield.tsx';
import { useInstance } from 'soapbox/hooks/useInstance.ts';

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
  const { instance } = useInstance();

  const handleChange = (key: string): React.ChangeEventHandler<HTMLInputElement> => {
    return e => {
      onChange({ ...value, [key]: e.currentTarget.value });
    };
  };

  const handleMarkerChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    onChange({ ...value, marker: (e.currentTarget.value as 'read' | 'write' | '') || undefined });
  };

  return (
    <HStack space={2} grow>
      <Input
        type='text'
        outerClassName='w-full grow'
        value={value.url}
        onChange={handleChange('url')}
        placeholder={instance.nostr?.relay ?? `wss://${instance.domain}/relay`}
      />

      <Select className='mt-1' full={false} onChange={handleMarkerChange}>
        <option value='' selected={value.marker === undefined}>
          <FormattedMessage id='nostr_relays.read_write' defaultMessage='Read & write' />
        </option>
        <option value='read' selected={value.marker === 'read'}>
          <FormattedMessage id='nostr_relays.read_only' defaultMessage='Read-only' />
        </option>
        <option value='write' selected={value.marker === 'write'}>
          <FormattedMessage id='nostr_relays.write_only' defaultMessage='Write-only' />
        </option>
      </Select>
    </HStack>
  );
};

export default RelayEditor;

export type { RelayData };