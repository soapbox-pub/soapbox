import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { changeAnnouncementAllDay, changeAnnouncementContent, changeAnnouncementEndTime, changeAnnouncementStartTime, handleCreateAnnouncement } from 'soapbox/actions/admin';
import { closeModal } from 'soapbox/actions/modals';
import { Form, FormGroup, HStack, Modal, Stack, Text, Textarea, Toggle } from 'soapbox/components/ui';
import BundleContainer from 'soapbox/features/ui/containers/bundle-container';
import { DatePicker } from 'soapbox/features/ui/util/async-components';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  save: { id: 'admin.edit_announcement.save', defaultMessage: 'Save' },
  announcementContentPlaceholder: { id: 'admin.edit_announcement.fields.content_placeholder', defaultMessage: 'Announcement content' },
  announcementStartTimePlaceholder: { id: 'admin.edit_announcement.fields.start_time_placeholder', defaultMessage: 'Announcement starts on…' },
  announcementEndTimePlaceholder: { id: 'admin.edit_announcement.fields.end_time_placeholder', defaultMessage: 'Announcement ends on…' },
});

interface IEditAnnouncementModal {
  onClose: (type?: string) => void
}

const EditAnnouncementModal: React.FC<IEditAnnouncementModal> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const id = useAppSelector((state) => state.admin_announcements.form.id);
  const content = useAppSelector((state) => state.admin_announcements.form.content);
  const startTime = useAppSelector((state) => state.admin_announcements.form.starts_at);
  const endTime = useAppSelector((state) => state.admin_announcements.form.ends_at);
  const allDay = useAppSelector((state) => state.admin_announcements.form.all_day);

  const onChangeContent: React.ChangeEventHandler<HTMLTextAreaElement> = ({ target }) =>
    dispatch(changeAnnouncementContent(target.value));

  const onChangeStartTime = (date: Date | null) => dispatch(changeAnnouncementStartTime(date));

  const onChangeEndTime = (date: Date | null) => dispatch(changeAnnouncementEndTime(date));

  const onChangeAllDay: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => dispatch(changeAnnouncementAllDay(target.checked));

  const onClickClose = () => {
    onClose('EDIT_ANNOUNCEMENT');
  };

  const handleSubmit = () => dispatch(handleCreateAnnouncement()).then(() => dispatch(closeModal('EDIT_ANNOUNCEMENT')));

  return (
    <Modal
      onClose={onClickClose}
      title={id
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
          <BundleContainer fetchComponent={DatePicker}>
            {Component => (<Component
              showTimeSelect
              dateFormat='MMMM d, yyyy h:mm aa'
              timeIntervals={15}
              wrapperClassName='react-datepicker-wrapper'
              placeholderText={intl.formatMessage(messages.announcementStartTimePlaceholder)}
              selected={startTime}
              onChange={onChangeStartTime}
              isClearable
            />)}
          </BundleContainer>
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_announcement.fields.end_time_label' defaultMessage='End date' />}
        >
          <BundleContainer fetchComponent={DatePicker}>
            {Component => (<Component
              showTimeSelect
              dateFormat='MMMM d, yyyy h:mm aa'
              timeIntervals={15}
              wrapperClassName='react-datepicker-wrapper'
              placeholderText={intl.formatMessage(messages.announcementEndTimePlaceholder)}
              selected={endTime}
              onChange={onChangeEndTime}
              isClearable
            />)}
          </BundleContainer>
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
