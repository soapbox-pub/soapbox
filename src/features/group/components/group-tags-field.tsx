import React, { useMemo } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { Input, Streamfield } from 'soapbox/components/ui';

import type { StreamfieldComponent } from 'soapbox/components/ui/streamfield/streamfield';

const messages = defineMessages({
  hashtagPlaceholder: { id: 'manage_group.fields.hashtag_placeholder', defaultMessage: 'Add a topic' },
});

interface IGroupTagsField {
  tags: string[]
  onChange(tags: string[]): void
  onAddItem(): void
  onRemoveItem(i: number): void
  maxItems?: number
}

const GroupTagsField: React.FC<IGroupTagsField> = ({ tags, onChange, onAddItem, onRemoveItem, maxItems = 3 }) => {
  return (
    <Streamfield
      label={<FormattedMessage id='group.tags.label' defaultMessage='Tags' />}
      hint={<FormattedMessage id='group.tags.hint' defaultMessage='Add up to 3 keywords that will serve as core topics of discussion in the group.' />}
      component={HashtagField}
      values={tags}
      onChange={onChange}
      onAddItem={onAddItem}
      onRemoveItem={onRemoveItem}
      maxItems={maxItems}
      minItems={1}
    />
  );
};

const HashtagField: StreamfieldComponent<string> = ({ value, onChange, autoFocus = false }) => {
  const intl = useIntl();

  const formattedValue = useMemo(() => {
    return `#${value}`;
  }, [value]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    onChange(target.value.replace('#', ''));
  };

  return (
    <Input
      outerClassName='w-full'
      type='text'
      value={formattedValue}
      onChange={handleChange}
      placeholder={intl.formatMessage(messages.hashtagPlaceholder)}
      autoFocus={autoFocus}
    />
  );
};

export default GroupTagsField;