import { useIntl, defineMessages } from 'react-intl';

import HStack from '@/components/ui/hstack.tsx';
import Input from '@/components/ui/input.tsx';

import type { StreamfieldComponent } from '@/components/ui/streamfield.tsx';
import type { FooterItem } from '@/types/soapbox.ts';

const messages = defineMessages({
  label: { id: 'soapbox_config.home_footer.meta_fields.label_placeholder', defaultMessage: 'Label' },
  url: { id: 'soapbox_config.home_footer.meta_fields.url_placeholder', defaultMessage: 'URL' },
});

const PromoPanelInput: StreamfieldComponent<FooterItem> = ({ value, onChange }) => {
  const intl = useIntl();

  const handleChange = (key: 'title' | 'url'): React.ChangeEventHandler<HTMLInputElement> => {
    return e => {
      onChange(value.set(key, e.currentTarget.value));
    };
  };

  return (
    <HStack space={2} grow>
      <Input
        type='text'
        outerClassName='w-full grow'
        placeholder={intl.formatMessage(messages.label)}
        value={value.title}
        onChange={handleChange('title')}
      />
      <Input
        type='text'
        outerClassName='w-full grow'
        placeholder={intl.formatMessage(messages.url)}
        value={value.url}
        onChange={handleChange('url')}
      />
    </HStack>
  );
};

export default PromoPanelInput;
