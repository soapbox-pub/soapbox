import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from 'soapbox/components/icon';
import { Avatar, Button, Column, Form, FormActions, FormGroup, HStack, Input, Spinner, Text, Textarea } from 'soapbox/components/ui';
import { useAppSelector, useInstance } from 'soapbox/hooks';
import { useGroup, useUpdateGroup } from 'soapbox/hooks/api';
import { useImageField, useTextField } from 'soapbox/hooks/forms';
import { isDefaultAvatar, isDefaultHeader } from 'soapbox/utils/accounts';

import type { List as ImmutableList } from 'immutable';

const nonDefaultAvatar = (url: string | undefined) => url && isDefaultAvatar(url) ? undefined : url;
const nonDefaultHeader = (url: string | undefined) => url && isDefaultHeader(url) ? undefined : url;

interface IMediaInput {
  src: string | undefined
  accept: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  disabled: boolean
}

const messages = defineMessages({
  heading: { id: 'navigation_bar.edit_group', defaultMessage: 'Edit Group' },
  groupNamePlaceholder: { id: 'manage_group.fields.name_placeholder', defaultMessage: 'Group Name' },
  groupDescriptionPlaceholder: { id: 'manage_group.fields.description_placeholder', defaultMessage: 'Description' },
});

const HeaderPicker = React.forwardRef<HTMLInputElement, IMediaInput>(({ src, onChange, accept, disabled }, ref) => {
  return (
    <label
      className='dark:sm:shadow-inset relative h-24 w-full cursor-pointer overflow-hidden rounded-lg bg-primary-100 text-primary-500 dark:bg-gray-800 dark:text-accent-blue sm:h-36 sm:shadow'
    >
      {src && <img className='h-full w-full object-cover' src={src} alt='' />}
      <HStack
        className={clsx('absolute top-0 h-full w-full transition-opacity', {
          'opacity-0 hover:opacity-90 bg-primary-100 dark:bg-gray-800': src,
        })}
        space={1.5}
        alignItems='center'
        justifyContent='center'
      >
        <Icon
          src={require('@tabler/icons/photo-plus.svg')}
          className='h-4.5 w-4.5'
        />

        <Text size='md' theme='primary' weight='semibold'>
          <FormattedMessage id='group.upload_banner' defaultMessage='Upload photo' />
        </Text>

        <input
          ref={ref}
          name='header'
          type='file'
          accept={accept}
          onChange={onChange}
          disabled={disabled}
          className='hidden'
        />
      </HStack>
    </label>
  );
});

const AvatarPicker = React.forwardRef<HTMLInputElement, IMediaInput>(({ src, onChange, accept, disabled }, ref) => {
  return (
    <label className='absolute left-1/2 bottom-0 h-20 w-20 -translate-x-1/2 translate-y-1/2 cursor-pointer rounded-full bg-primary-500 ring-2 ring-white dark:ring-primary-900'>
      {src && <Avatar src={src} size={80} />}
      <HStack
        alignItems='center'
        justifyContent='center'

        className={clsx('absolute left-0 top-0 h-full w-full rounded-full transition-opacity', {
          'opacity-0 hover:opacity-90 bg-primary-500': src,
        })}
      >
        <Icon
          src={require('@tabler/icons/camera-plus.svg')}
          className='h-5 w-5 text-white'
        />
      </HStack>
      <span className='sr-only'>Upload avatar</span>
      <input
        ref={ref}
        name='avatar'
        type='file'
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        className='hidden'
      />
    </label>
  );
});

interface IEditGroup {
  params: {
    id: string
  }
}

const EditGroup: React.FC<IEditGroup> = ({ params: { id: groupId } }) => {
  const intl = useIntl();
  const instance = useInstance();

  const { group, isLoading } = useGroup(groupId);
  const { updateGroup } = useUpdateGroup(groupId);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarField = useImageField({ maxPixels: 400 * 400, preview: nonDefaultAvatar(group?.avatar) });
  const headerField = useImageField({ maxPixels: 1920 * 1080, preview: nonDefaultHeader(group?.header) });

  const displayNameField = useTextField(group?.display_name);
  const noteField = useTextField(group?.note);

  const maxName = Number(instance.configuration.getIn(['groups', 'max_characters_name']));
  const maxNote = Number(instance.configuration.getIn(['groups', 'max_characters_description']));

  const attachmentTypes = useAppSelector(
    state => state.instance.configuration.getIn(['media_attachments', 'supported_mime_types']) as ImmutableList<string>,
  )?.filter(type => type.startsWith('image/')).toArray().join(',');

  async function handleSubmit() {
    setIsSubmitting(true);

    await updateGroup({
      display_name: displayNameField.value,
      note: noteField.value,
      avatar: avatarField.file,
      header: headerField.file,
    });

    setIsSubmitting(false);
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form onSubmit={handleSubmit}>
        <div className='relative mb-12 flex'>
          <HeaderPicker accept={attachmentTypes} disabled={isSubmitting} {...headerField} />
          <AvatarPicker accept={attachmentTypes} disabled={isSubmitting} {...avatarField} />
        </div>
        <FormGroup
          labelText={<FormattedMessage id='manage_group.fields.name_label' defaultMessage='Group name (required)' />}
        >
          <Input
            type='text'
            placeholder={intl.formatMessage(messages.groupNamePlaceholder)}
            {...displayNameField}
            maxLength={maxName}
          />
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='manage_group.fields.description_label' defaultMessage='Description' />}
        >
          <Textarea
            autoComplete='off'
            placeholder={intl.formatMessage(messages.groupDescriptionPlaceholder)}
            {...noteField}
            maxLength={maxNote}
          />
        </FormGroup>

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
