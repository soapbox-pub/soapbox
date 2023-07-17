import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { CreateGroupParams, useGroupValidation } from 'soapbox/api/hooks';
import { Form, FormGroup, Input, Textarea } from 'soapbox/components/ui';
import AvatarPicker from 'soapbox/features/edit-profile/components/avatar-picker';
import HeaderPicker from 'soapbox/features/edit-profile/components/header-picker';
import GroupTagsField from 'soapbox/features/group/components/group-tags-field';
import { useAppSelector, useDebounce, useInstance } from 'soapbox/hooks';
import { usePreview } from 'soapbox/hooks/forms';
import resizeImage from 'soapbox/utils/resize-image';

import type { List as ImmutableList } from 'immutable';

const messages = defineMessages({
  groupNamePlaceholder: { id: 'manage_group.fields.name_placeholder', defaultMessage: 'Group Name' },
  groupDescriptionPlaceholder: { id: 'manage_group.fields.description_placeholder', defaultMessage: 'Description' },
  hashtagPlaceholder: { id: 'manage_group.fields.hashtag_placeholder', defaultMessage: 'Add a topic' },
});

interface IDetailsStep {
  params: CreateGroupParams
  onChange(params: CreateGroupParams): void
}

const DetailsStep: React.FC<IDetailsStep> = ({ params, onChange }) => {
  const intl = useIntl();
  const debounce = useDebounce;
  const instance = useInstance();

  const {
    display_name: displayName = '',
    note = '',
    tags = [''],
  } = params;

  const debouncedName = debounce(displayName, 300);
  const { data: { isValid, message: errorMessage } } = useGroupValidation(debouncedName);

  const avatarSrc = usePreview(params.avatar);
  const headerSrc = usePreview(params.header);

  const attachmentTypes = useAppSelector(
    state => state.instance.configuration.getIn(['media_attachments', 'supported_mime_types']) as ImmutableList<string>,
  )?.filter(type => type.startsWith('image/')).toArray().join(',');

  const handleTextChange = (property: keyof CreateGroupParams): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> => {
    return (e) => {
      onChange({
        ...params,
        [property]: e.target.value,
      });
    };
  };

  const handleImageChange = (property: keyof CreateGroupParams, maxPixels?: number): React.ChangeEventHandler<HTMLInputElement> => {
    return async ({ target: { files } }) => {
      const file = files ? files[0] : undefined;
      if (file) {
        const resized = await resizeImage(file, maxPixels);
        onChange({
          ...params,
          [property]: resized,
        });
      }
    };
  };

  const handleImageClear = (property: keyof CreateGroupParams) => () => onChange({ [property]: undefined });

  const handleTagsChange = (tags: string[]) => {
    onChange({
      ...params,
      tags,
    });
  };

  const handleAddTag = () => {
    onChange({
      ...params,
      tags: [...tags, ''],
    });
  };

  const handleRemoveTag = (i: number) => {
    const newTags = [...tags];
    newTags.splice(i, 1);
    onChange({
      ...params,
      tags: newTags,
    });
  };

  return (
    <Form>
      <div className='relative mb-12 flex'>
        <HeaderPicker src={headerSrc} accept={attachmentTypes} onChange={handleImageChange('header', 1920 * 1080)} onClear={handleImageClear('header')} />
        <AvatarPicker src={avatarSrc} accept={attachmentTypes} onChange={handleImageChange('avatar', 400 * 400)} />
      </div>

      <FormGroup
        labelText={<FormattedMessage id='manage_group.fields.name_label' defaultMessage='Group name (required)' />}
        hintText={<FormattedMessage id='manage_group.fields.name_help' defaultMessage='This cannot be changed after the group is created.' />}
        errors={isValid ? [] : [errorMessage as string]}
      >
        <Input
          type='text'
          placeholder={intl.formatMessage(messages.groupNamePlaceholder)}
          value={displayName}
          onChange={handleTextChange('display_name')}
          maxLength={Number(instance.configuration.getIn(['groups', 'max_characters_name']))}
        />
      </FormGroup>

      <FormGroup
        labelText={<FormattedMessage id='manage_group.fields.description_label' defaultMessage='Description' />}
      >
        <Textarea
          autoComplete='off'
          placeholder={intl.formatMessage(messages.groupDescriptionPlaceholder)}
          value={note}
          onChange={handleTextChange('note')}
          maxLength={Number(instance.configuration.getIn(['groups', 'max_characters_description']))}
        />
      </FormGroup>

      <div className='pb-6'>
        <GroupTagsField
          tags={tags}
          onChange={handleTagsChange}
          onAddItem={handleAddTag}
          onRemoveItem={handleRemoveTag}
        />
      </div>
    </Form>
  );
};

export default DetailsStep;
