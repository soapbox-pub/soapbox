import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Input, Streamfield } from 'soapbox/components/ui';

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
      label='Topics'
      hint='Add up to 3 keywords that will serve as core topics of discussion in the group.'
      component={HashtagField}
      values={tags}
      onChange={onChange}
      onAddItem={onAddItem}
      onRemoveItem={onRemoveItem}
      maxItems={maxItems}
    />
  );
};

interface IHashtagField {
  value: string
  onChange: (value: string) => void
}

const HashtagField: React.FC<IHashtagField> = ({ value, onChange }) => {
  const intl = useIntl();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    onChange(target.value);
  };

  return (
    <Input
      outerClassName='w-full'
      type='text'
      value={value}
      onChange={handleChange}
      placeholder={intl.formatMessage(messages.hashtagPlaceholder)}
    />
  );
};

export default GroupTagsField;