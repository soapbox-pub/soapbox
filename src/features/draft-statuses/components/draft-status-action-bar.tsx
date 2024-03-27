import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { setComposeToStatus } from 'soapbox/actions/compose';
import { cancelDraftStatus } from 'soapbox/actions/draft-statuses';
import { openModal } from 'soapbox/actions/modals';
import { getSettings } from 'soapbox/actions/settings';
import { Button, HStack } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import type { DraftStatus } from 'soapbox/reducers/draft-statuses';
import type { Status as StatusEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  edit: { id: 'draft_status.edit', defaultMessage: 'Edit' },
  cancel: { id: 'draft_status.cancel', defaultMessage: 'Cancel' },
  deleteConfirm: { id: 'confirmations.draft_status_delete.confirm', defaultMessage: 'Discard' },
  deleteHeading: { id: 'confirmations.draft_status_delete.heading', defaultMessage: 'Cancel draft post' },
  deleteMessage: { id: 'confirmations.draft_status_delete.message', defaultMessage: 'Are you sure you want to discard this draft post?' },
});

interface IDraftStatusActionBar {
  source: DraftStatus;
  status: StatusEntity;
}

const DraftStatusActionBar: React.FC<IDraftStatusActionBar> = ({ source, status }) => {
  const intl = useIntl();

  const dispatch = useAppDispatch();

  const handleCancelClick = () => {
    dispatch((_, getState) => {

      const deleteModal = getSettings(getState()).get('deleteModal');
      if (!deleteModal) {
        dispatch(cancelDraftStatus(source.draft_id));
      } else {
        dispatch(openModal('CONFIRM', {
          icon: require('@tabler/icons/calendar-stats.svg'),
          heading: intl.formatMessage(messages.deleteHeading),
          message: intl.formatMessage(messages.deleteMessage),
          confirm: intl.formatMessage(messages.deleteConfirm),
          onConfirm: () => dispatch(cancelDraftStatus(source.draft_id)),
        }));
      }
    });
  };

  const handleEditClick = () => {
    dispatch(setComposeToStatus(status, source.text, source.spoiler_text, source.content_type, false, source.draft_id, source.editorState));
    dispatch(openModal('COMPOSE'));
  };

  return (
    <HStack space={2} justifyContent='end'>
      <Button theme='primary' size='sm' onClick={handleEditClick}>
        <FormattedMessage id='draft_status.edit' defaultMessage='Edit' />
      </Button>
      <Button theme='danger' size='sm' onClick={handleCancelClick}>
        <FormattedMessage id='draft_status.cancel' defaultMessage='Delete' />
      </Button>
    </HStack>
  );
};

export default DraftStatusActionBar;
