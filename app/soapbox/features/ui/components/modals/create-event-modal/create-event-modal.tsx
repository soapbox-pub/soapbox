import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Toggle from 'react-toggle';

import {
  changeCreateEventApprovalRequired,
  changeCreateEventDescription,
  changeCreateEventEndTime,
  changeCreateEventHasEndTime,
  changeCreateEventName,
  changeCreateEventStartTime,
  changeCreateEventLocation,
  uploadEventBanner,
  undoUploadEventBanner,
  submitEvent,
} from 'soapbox/actions/events';
import { ADDRESS_ICONS } from 'soapbox/components/autosuggest-location';
import LocationSearch from 'soapbox/components/location-search';
import { Form, FormGroup, HStack, Icon, IconButton, Input, Modal, Stack, Text, Textarea } from 'soapbox/components/ui';
import { isCurrentOrFutureDate } from 'soapbox/features/compose/components/schedule_form';
import BundleContainer from 'soapbox/features/ui/containers/bundle_container';
import { DatePicker } from 'soapbox/features/ui/util/async-components';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import UploadButton from './upload-button';

const messages = defineMessages({
  eventNamePlaceholder: { id: 'create_event.fields.name_placeholder', defaultMessage: 'Name' },
  eventDescriptionPlaceholder: { id: 'create_event.fields.description_placeholder', defaultMessage: 'Description' },
  eventStartTimePlaceholder: { id: 'create_event.fields.start_time_placeholder', defaultMessage: 'Event begins on…' },
  eventEndTimePlaceholder: { id: 'create_event.fields.end_time_placeholder', defaultMessage: 'Event ends on…' },
  resetLocation: { id: 'create_event.reset_location', defaultMessage: 'Reset location' },
});

interface ICreateEventModal {
  onClose: (type?: string) => void,
}

const CreateEventModal: React.FC<ICreateEventModal> = ({ onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const banner = useAppSelector((state) => state.create_event.banner);
  const isUploading = useAppSelector((state) => state.create_event.is_uploading);

  const name = useAppSelector((state) => state.create_event.name);
  const description = useAppSelector((state) => state.create_event.status);
  const startTime = useAppSelector((state) => state.create_event.start_time);
  const endTime = useAppSelector((state) => state.create_event.end_time);
  const approvalRequired = useAppSelector((state) => state.create_event.approval_required);
  const location = useAppSelector((state) => state.create_event.location);

  const isSubmitting = useAppSelector((state) => state.create_event.is_submitting);

  const onChangeName: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    dispatch(changeCreateEventName(target.value));
  };

  const onChangeDescription: React.ChangeEventHandler<HTMLTextAreaElement> = ({ target }) => {
    dispatch(changeCreateEventDescription(target.value));
  };

  const onChangeStartTime = (date: Date) => {
    dispatch(changeCreateEventStartTime(date));
  };

  const onChangeEndTime = (date: Date) => {
    dispatch(changeCreateEventEndTime(date));
  };

  const onChangeHasEndTime: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    dispatch(changeCreateEventHasEndTime(target.checked));
  };

  const onChangeApprovalRequired: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    dispatch(changeCreateEventApprovalRequired(target.checked));
  };

  const onChangeLocation = (value: string | null) => {
    dispatch(changeCreateEventLocation(value));
  };

  const onClickClose = () => {
    onClose('CREATE_EVENT');
  };

  const handleFiles = (files: FileList) => {
    dispatch(uploadEventBanner(files[0], intl));
  };

  const handleClearBanner = () => {
    dispatch(undoUploadEventBanner());
  };

  const handleSubmit = () => {
    dispatch(submitEvent());
  };

  const renderLocation = () => location && (
    <HStack className='h-[38px] text-gray-700 dark:text-gray-500' alignItems='center' space={2}>
      <Icon src={ADDRESS_ICONS[location.type] || require('@tabler/icons/map-pin.svg')} />
      <Stack className='flex-grow'>
        <Text>{location.description}</Text>
        <Text theme='muted' size='xs'>{[location.street, location.locality, location.country].filter(val => val.trim()).join(' · ')}</Text>
      </Stack>
      <IconButton title={intl.formatMessage(messages.resetLocation)} src={require('@tabler/icons/x.svg')} onClick={() => onChangeLocation(null)} />
    </HStack>
  );

  return (
    <Modal
      title={<FormattedMessage id='navigation_bar.create_event' defaultMessage='Create new event' />}
      confirmationAction={handleSubmit}
      confirmationText={<FormattedMessage id='create_event.create' defaultMessage='Create' />}
      confirmationDisabled={isSubmitting}
      onClose={onClickClose}
    >
      <Form>
        <FormGroup
          labelText={<FormattedMessage id='create_event.fields.banner_label' defaultMessage='Event banner' />}
        >
          <div className='flex items-center justify-center bg-gray-200 dark:bg-gray-900/50 rounded-lg text-black dark:text-white sm:shadow dark:sm:shadow-inset overflow-hidden h-24 sm:h-32 relative'>
            {banner ? (
              <>
                <img className='h-full w-full object-cover' src={banner.url} alt='' />
                <IconButton className='absolute top-2 right-2' src={require('@tabler/icons/x.svg')} onClick={handleClearBanner} />
              </>
            ) : (
              <UploadButton disabled={isUploading} onSelectFile={handleFiles} />
            )}

          </div>
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='create_event.fields.name_label' defaultMessage='Event name' />}
        >
          <Input
            type='text'
            placeholder={intl.formatMessage(messages.eventNamePlaceholder)}
            value={name}
            onChange={onChangeName}
          />
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='create_event.fields.description_label' defaultMessage='Event description' />}
          hintText={<FormattedMessage id='create_event.fields.description_hint' defaultMessage='Markdown syntax is supported' />}
        >
          <Textarea
            autoComplete='off'
            placeholder={intl.formatMessage(messages.eventDescriptionPlaceholder)}
            value={description}
            onChange={onChangeDescription}
          />
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='create_event.fields.location_label' defaultMessage='Event location' />}
        >
          {location ? renderLocation() : (
            <LocationSearch
              onSelected={onChangeLocation}
            />
          )}
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='create_event.fields.start_time_label' defaultMessage='Event start date' />}
        >
          <BundleContainer fetchComponent={DatePicker}>
            {Component => (<Component
              showTimeSelect
              dateFormat='MMMM d, yyyy h:mm aa'
              timeIntervals={15}
              wrapperClassName='react-datepicker-wrapper'
              placeholderText={intl.formatMessage(messages.eventStartTimePlaceholder)}
              filterDate={isCurrentOrFutureDate}
              selected={startTime}
              onChange={onChangeStartTime}
            />)}
          </BundleContainer>
        </FormGroup>
        <HStack alignItems='center' space={2}>
          <Toggle
            icons={false}
            checked={!!endTime}
            onChange={onChangeHasEndTime}
          />
          <Text tag='span' theme='muted'>
            <FormattedMessage id='create_event.fields.has_end_time' defaultMessage='The event has end date' />
          </Text>
        </HStack>
        {endTime && (
          <FormGroup
            labelText={<FormattedMessage id='create_event.fields.end_time_label' defaultMessage='Event end date' />}
          >
            <BundleContainer fetchComponent={DatePicker}>
              {Component => (<Component
                showTimeSelect
                dateFormat='MMMM d, yyyy h:mm aa'
                timeIntervals={15}
                wrapperClassName='react-datepicker-wrapper'
                placeholderText={intl.formatMessage(messages.eventEndTimePlaceholder)}
                filterDate={isCurrentOrFutureDate}
                selected={endTime}
                onChange={onChangeEndTime}
              />)}
            </BundleContainer>
          </FormGroup>
        )}
        <HStack alignItems='center' space={2}>
          <Toggle
            icons={false}
            checked={approvalRequired}
            onChange={onChangeApprovalRequired}
          />
          <Text tag='span' theme='muted'>
            <FormattedMessage id='create_event.fields.approval_required' defaultMessage='I want to approve participation requests manually' />
          </Text>
        </HStack>
      </Form>
    </Modal>
  );
};

export default CreateEventModal;
