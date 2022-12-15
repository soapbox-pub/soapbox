import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import {
  changeGroupEditorTitle,
  changeGroupEditorDescription,
  changeGroupEditorMedia,
} from 'soapbox/actions/groups';
import Icon from 'soapbox/components/icon';
import { Avatar, Form, FormGroup, HStack, IconButton, Input, Text, Textarea } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import resizeImage from 'soapbox/utils/resize-image';

import type { List as ImmutableList } from 'immutable';

const messages = defineMessages({
  groupNamePlaceholder: { id: 'manage_group.fields.name_placeholder', defaultMessage: 'Group Name' },
  groupDescriptionPlaceholder: { id: 'manage_group.fields.description_placeholder', defaultMessage: 'Description' },
});

const DetailsStep = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const isUploading = useAppSelector((state) => state.group_editor.isUploading);
  const name = useAppSelector((state) => state.group_editor.displayName);
  const description = useAppSelector((state) => state.group_editor.note);

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [headerSrc, setHeaderSrc] = useState<string | null>(null);

  const attachmentTypes = useAppSelector(state => state.instance.configuration.getIn(['media_attachments', 'supported_mime_types']) as ImmutableList<string>)?.filter(type => type.startsWith('image/'));

  const onChangeName: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    dispatch(changeGroupEditorTitle(target.value));
  };

  const onChangeDescription: React.ChangeEventHandler<HTMLTextAreaElement> = ({ target }) => {
    dispatch(changeGroupEditorDescription(target.value));
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const rawFile = e.target.files?.item(0);

    if (!rawFile) return;

    if (e.target.name === 'avatar') {
      resizeImage(rawFile, 400 * 400).then(file => {
        dispatch(changeGroupEditorMedia('avatar', file));
        setAvatarSrc(URL.createObjectURL(file));
      }).catch(console.error);
    } else {
      resizeImage(rawFile, 1920 * 1080).then(file => {
        dispatch(changeGroupEditorMedia('header', file));
        setHeaderSrc(URL.createObjectURL(file));
      }).catch(console.error);
    }
  };
  return (
    <Form>
      <div className='flex items-center justify-center mb-12 bg-primary-100 dark:bg-gray-800 rounded-lg text-black dark:text-white sm:shadow dark:sm:shadow-inset h-24 sm:h-36 relative'>
        {headerSrc ? (
          <>
            <img className='h-full w-full object-cover' src={headerSrc} alt='' />
            <IconButton className='absolute top-2 right-2' src={require('@tabler/icons/x.svg')} onClick={() => {}} />
          </>
        ) : (
          <HStack className='h-full w-full text-primary-500 dark:text-accent-blue cursor-pointer' space={3} alignItems='center' justifyContent='center' element='label'>
            <Icon
              src={require('@tabler/icons/photo-plus.svg')}
              className='h-7 w-7'
            />

            <Text size='sm' theme='primary' weight='semibold' transform='uppercase'>
              <FormattedMessage id='compose_event.upload_banner' defaultMessage='Upload photo' />
            </Text>
            <input
              name='header'
              type='file'
              accept={attachmentTypes && attachmentTypes.toArray().join(',')}
              onChange={handleFileChange}
              disabled={isUploading}
              className='hidden'
            />
          </HStack>
        )}
        <div className='absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2'>
          {avatarSrc ? (
            <Avatar className='ring-2 ring-white dark:ring-primary-900' src={avatarSrc} size={72} />
          ) : (
            <label className='flex items-center justify-center h-[72px] w-[72px] bg-primary-500 rounded-full ring-2 ring-white dark:ring-primary-900'>
              <Icon
                src={require('@tabler/icons/camera-plus.svg')}
                className='h-7 w-7 text-white'
              />
              <span className='sr-only'>Upload avatar</span>
              <input
                name='avatar'
                type='file'
                accept={attachmentTypes && attachmentTypes.toArray().join(',')}
                onChange={handleFileChange}
                disabled={isUploading}
                className='hidden'
              />
            </label>
          )}
        </div>
      </div>
      <FormGroup
        labelText={<FormattedMessage id='manage_group.fields.name_label' defaultMessage='Group name (required)' />}
      >
        <Input
          type='text'
          placeholder={intl.formatMessage(messages.groupNamePlaceholder)}
          value={name}
          onChange={onChangeName}
        />
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='manage_group.fields.description_label' defaultMessage='Description' />}
      >
        <Textarea
          autoComplete='off'
          placeholder={intl.formatMessage(messages.groupDescriptionPlaceholder)}
          value={description}
          onChange={onChangeDescription}
        />
      </FormGroup>
    </Form>
  );
};

export default DetailsStep;
