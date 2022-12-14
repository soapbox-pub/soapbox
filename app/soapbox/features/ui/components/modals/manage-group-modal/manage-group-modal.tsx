import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import {
  changeGroupEditorTitle,
  changeGroupEditorDescription,
  submitGroupEditor,
} from 'soapbox/actions/groups';
import { Form, FormGroup, Input, Modal, Stack, Textarea } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  groupNamePlaceholder: { id: 'manage_group.fields.name_placeholder', defaultMessage: 'Name' },
  groupDescriptionPlaceholder: { id: 'manage_group.fields.description_placeholder', defaultMessage: 'Description' },
});

interface IManageGroupModal {
  onClose: (type?: string) => void,
}

const ManageGroupModal: React.FC<IManageGroupModal> = ({ onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const name = useAppSelector((state) => state.group_editor.displayName);
  const description = useAppSelector((state) => state.group_editor.note);

  const id = useAppSelector((state) => state.group_editor.groupId);

  const isSubmitting = useAppSelector((state) => state.group_editor.isSubmitting);

  const onChangeName: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    dispatch(changeGroupEditorTitle(target.value));
  };

  const onChangeDescription: React.ChangeEventHandler<HTMLTextAreaElement> = ({ target }) => {
    dispatch(changeGroupEditorDescription(target.value));
  };

  const onClickClose = () => {
    onClose('manage_group');
  };

  const handleSubmit = () => {
    dispatch(submitGroupEditor(true));
  };

  const body = (
    <Form>
      <FormGroup
        labelText={<FormattedMessage id='manage_group.fields.name_label' defaultMessage='Group name' />}
      >
        <Input
          type='text'
          placeholder={intl.formatMessage(messages.groupNamePlaceholder)}
          value={name}
          onChange={onChangeName}
        />
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='manage_group.fields.description_label' defaultMessage='Group description' />}
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

  return (
    <Modal
      title={id
        ? <FormattedMessage id='navigation_bar.manage_group' defaultMessage='Manage group' />
        : <FormattedMessage id='navigation_bar.create_group' defaultMessage='Create new group' />}
      confirmationAction={handleSubmit}
      confirmationText={id
        ? <FormattedMessage id='manage_group.update' defaultMessage='Update' />
        : <FormattedMessage id='manage_group.create' defaultMessage='Create' />}
      confirmationDisabled={isSubmitting}
      onClose={onClickClose}
    >
      <Stack space={2}>
        {body}
      </Stack>
    </Modal>
  );
};

export default ManageGroupModal;
