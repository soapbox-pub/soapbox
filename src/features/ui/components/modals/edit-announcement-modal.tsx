import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { closeModal } from 'soapbox/actions/modals';
import { useAnnouncements } from 'soapbox/api/hooks/admin/useAnnouncements';
import { Form, FormGroup, HStack, Modal, Stack, Text, Textarea, Toggle } from 'soapbox/components/ui';
import { DatePicker } from 'soapbox/features/ui/util/async-components';
import { useAppDispatch } from 'soapbox/hooks';
import toast from 'soapbox/toast';

import type { AdminAnnouncement } from 'soapbox/schemas';

const messages = defineMessages({
  save: { id: 'admin.edit_announcement.save', defaultMessage: 'Save' },
  announcementContentPlaceholder: { id: 'admin.edit_announcement.fields.content_placeholder', defaultMessage: 'Announcement content' },
  announcementStartTimePlaceholder: { id: 'admin.edit_announcement.fields.start_time_placeholder', defaultMessage: 'Announcement starts on:' },
  announcementEndTimePlaceholder: { id: 'admin.edit_announcement.fields.end_time_placeholder', defaultMessage: 'Announcement ends on:' },
  announcementCreateSuccess: { id: 'admin.edit_announcement.created', defaultMessage: 'Announcement created' },
  announcementUpdateSuccess: { id: 'admin.edit_announcement.updated', defaultMessage: 'Announcement edited' },
});

interface IEditAnnouncementModal {
  onClose: (type?: string) => void;
  announcement?: AdminAnnouncement;
}

const EditAnnouncementModal: React.FC<IEditAnnouncementModal> = ({ onClose, announcement }) => {
  const dispatch = useAppDispatch();
  const { createAnnouncement, updateAnnouncement } = useAnnouncements();
  const intl = useIntl();

  const [content, setContent] = useState(announcement?.content || '');
  const [startTime, setStartTime] = useState(announcement?.starts_at ? new Date(announcement.starts_at) : null);
  const [endTime, setEndTime] = useState(announcement?.ends_at ? new Date(announcement.ends_at) : null);
  const [allDay, setAllDay] = useState(announcement?.all_day || false);

  const onChangeContent: React.ChangeEventHandler<HTMLTextAreaElement> = ({ target }) => setContent(target.value);

  const onChangeStartTime = (date: Date | null) => setStartTime(date);

  const onChangeEndTime = (date: Date | null) => setEndTime(date);

  const onChangeAllDay: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => setAllDay(target.checked);

  const onClickClose = () => {
    onClose('EDIT_ANNOUNCEMENT');
  };

  const handleSubmit = () => {
    const form = {
      content,
      starts_at: startTime?.toISOString() || null,
      ends_at: endTime?.toISOString() || null,
      all_day: allDay,
    };

    if (announcement) {
      updateAnnouncement({ ...form, id: announcement.id }, {
        onSuccess: () => {
          dispatch(closeModal('EDIT_ANNOUNCEMENT'));
          toast.success(messages.announcementUpdateSuccess);
        },
      });
    } else {
      createAnnouncement(form, {
        onSuccess: () => {
          dispatch(closeModal('EDIT_ANNOUNCEMENT'));
          toast.success(messages.announcementCreateSuccess);
        },
      });
    }
  };

  return (
    <Modal
      onClose={onClickClose}
      title={announcement
        ? <FormattedMessage id='column.admin.edit_announcement' defaultMessage='Edit announcement' />
        : <FormattedMessage id='column.admin.create_announcement' defaultMessage='Create announcement' />}
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.save)}
    >
      <Form>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_announcement.fields.content_label' defaultMessage='Content' />}
        >
          <Textarea
            autoComplete='off'
            placeholder={intl.formatMessage(messages.announcementContentPlaceholder)}
            value={content}
            onChange={onChangeContent}
          />
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_announcement.fields.start_time_label' defaultMessage='Start date' />}
        >
          <DatePicker
            showTimeSelect
            dateFormat='MMMM d, yyyy h:mm aa'
            timeIntervals={15}
            wrapperClassName='react-datepicker-wrapper'
            placeholderText={intl.formatMessage(messages.announcementStartTimePlaceholder)}
            selected={startTime}
            onChange={onChangeStartTime}
            isClearable
          />
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_announcement.fields.end_time_label' defaultMessage='End date' />}
        >
          <DatePicker
            showTimeSelect
            dateFormat='MMMM d, yyyy h:mm aa'
            timeIntervals={15}
            wrapperClassName='react-datepicker-wrapper'
            placeholderText={intl.formatMessage(messages.announcementEndTimePlaceholder)}
            selected={endTime}
            onChange={onChangeEndTime}
            isClearable
          />
        </FormGroup>
        <HStack alignItems='center' space={2}>
          <Toggle
            checked={allDay}
            onChange={onChangeAllDay}
          />
          <Stack>
            <Text tag='span' theme='muted'>
              <FormattedMessage id='admin.edit_announcement.fields.all_day_label' defaultMessage='All-day event' />
            </Text>
            <Text size='xs' tag='span' theme='muted'>
              <FormattedMessage id='admin.edit_announcement.fields.all_day_hint' defaultMessage='When checked, only the dates of the time range will be displayed' />
            </Text>
          </Stack>
        </HStack>
      </Form>
    </Modal>
  );
};

export default EditAnnouncementModal;
