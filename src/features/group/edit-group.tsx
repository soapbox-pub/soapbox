import lockIcon from '@tabler/icons/outline/lock.svg';
import { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useGroup, useGroupTags, useUpdateGroup } from 'soapbox/api/hooks/index.ts';
import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import FormActions from 'soapbox/components/ui/form-actions.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Textarea from 'soapbox/components/ui/textarea.tsx';
import { useImageField, useTextField } from 'soapbox/hooks/forms/index.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import toast from 'soapbox/toast.tsx';
import { isDefaultAvatar, isDefaultHeader } from 'soapbox/utils/accounts.ts';
import { htmlToPlaintext } from 'soapbox/utils/html.ts';

import AvatarPicker from '../edit-profile/components/avatar-picker.tsx';
import HeaderPicker from '../edit-profile/components/header-picker.tsx';

import GroupTagsField from './components/group-tags-field.tsx';

const nonDefaultAvatar = (url: string | undefined) => url && isDefaultAvatar(url) ? undefined : url;
const nonDefaultHeader = (url: string | undefined) => url && isDefaultHeader(url) ? undefined : url;

const messages = defineMessages({
  heading: { id: 'navigation_bar.edit_group', defaultMessage: 'Edit Group' },
  groupNamePlaceholder: { id: 'manage_group.fields.name_placeholder', defaultMessage: 'Group Name' },
  groupDescriptionPlaceholder: { id: 'manage_group.fields.description_placeholder', defaultMessage: 'Description' },
  groupSaved: { id: 'group.update.success', defaultMessage: 'Group successfully saved' },
});

interface IEditGroup {
  params: {
    groupId: string;
  };
}

const EditGroup: React.FC<IEditGroup> = ({ params: { groupId } }) => {
  const intl = useIntl();
  const { instance } = useInstance();

  const { group, isLoading } = useGroup(groupId);
  const { updateGroup } = useUpdateGroup(groupId);
  const { invalidate } = useGroupTags(groupId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(['']);

  const avatar = useImageField({ maxPixels: 400 * 400, preview: nonDefaultAvatar(group?.avatar) });
  const header = useImageField({ maxPixels: 1920 * 1080, preview: nonDefaultHeader(group?.header) });

  const displayName = useTextField(group?.display_name);
  const note = useTextField(htmlToPlaintext(group?.note || ''));

  const maxName = Number(instance.configuration.groups.max_characters_name);
  const maxNote = Number(instance.configuration.groups.max_characters_description);

  const attachmentTypes = useAppSelector(state => state.instance.configuration.media_attachments.supported_mime_types)
    ?.filter((type) => type.startsWith('image/'))
    .join(',');

  async function handleSubmit() {
    setIsSubmitting(true);

    await updateGroup({
      display_name: displayName.value,
      note: note.value,
      avatar: avatar.file === null ? '' : avatar.file,
      header: header.file === null ? '' : header.file,
      tags,
    }, {
      onSuccess() {
        invalidate();
        toast.success(intl.formatMessage(messages.groupSaved));
      },
      async onError(error) {
        const message = (await error.response.json() as any)?.error;

        if (error.response.status === 422 && message) {
          toast.error(message);
        }
      },
    });

    setIsSubmitting(false);
  }

  const handleAddTag = () => {
    setTags([...tags, '']);
  };

  const handleRemoveTag = (i: number) => {
    const newTags = [...tags];
    newTags.splice(i, 1);
    setTags(newTags);
  };

  useEffect(() => {
    if (group) {
      setTags(group.tags.map((t) => t.name));
    }
  }, [group?.id]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form onSubmit={handleSubmit}>
        <div className='relative mb-12 flex'>
          <HeaderPicker accept={attachmentTypes} disabled={isSubmitting} {...header} />
          <AvatarPicker accept={attachmentTypes} disabled={isSubmitting} {...avatar} />
        </div>
        <FormGroup
          labelText={<FormattedMessage id='manage_group.fields.name_label_optional' defaultMessage='Group name' />}
          hintText={<FormattedMessage id='manage_group.fields.cannot_change_hint' defaultMessage='This cannot be changed after the group is created.' />}
        >
          <Input
            type='text'
            placeholder={intl.formatMessage(messages.groupNamePlaceholder)}
            maxLength={maxName}
            {...displayName}
            append={<Icon className='size-5 text-gray-600' src={lockIcon} />}
            disabled
          />
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='manage_group.fields.description_label' defaultMessage='Description' />}
        >
          <Textarea
            autoComplete='off'
            placeholder={intl.formatMessage(messages.groupDescriptionPlaceholder)}
            maxLength={maxNote}
            {...note}
          />
        </FormGroup>

        <div className='pb-6'>
          <GroupTagsField
            tags={tags}
            onChange={setTags}
            onAddItem={handleAddTag}
            onRemoveItem={handleRemoveTag}
          />
        </div>

        <FormActions>
          <Button theme='primary' type='submit' disabled={isSubmitting} block>
            <FormattedMessage id='edit_profile.save' defaultMessage='Save' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export default EditGroup;
