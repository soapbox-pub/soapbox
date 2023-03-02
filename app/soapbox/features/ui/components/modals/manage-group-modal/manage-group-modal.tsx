import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { submitGroupEditor } from 'soapbox/actions/groups';
import { Modal, Stack } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import DetailsStep from './steps/details-step';
import PrivacyStep from './steps/privacy-step';

const messages = defineMessages({
  next: { id: 'manage_group.next', defaultMessage: 'Next' },
  create: { id: 'manage_group.create', defaultMessage: 'Create' },
  update: { id: 'manage_group.update', defaultMessage: 'Update' },
});

enum Steps {
  ONE = 'ONE',
  TWO = 'TWO',
}

const manageGroupSteps = {
  ONE: PrivacyStep,
  TWO: DetailsStep,
};

interface IManageGroupModal {
  onClose: (type?: string) => void
}

const ManageGroupModal: React.FC<IManageGroupModal> = ({ onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const id = useAppSelector((state) => state.group_editor.groupId);

  const isSubmitting = useAppSelector((state) => state.group_editor.isSubmitting);

  const [currentStep, setCurrentStep] = useState<Steps>(id ? Steps.TWO : Steps.ONE);

  const onClickClose = () => {
    onClose('MANAGE_GROUP');
  };

  const handleSubmit = () => {
    dispatch(submitGroupEditor(true));
  };

  const confirmationText = useMemo(() => {
    switch (currentStep) {
      case Steps.TWO:
        return intl.formatMessage(id ? messages.update : messages.create);
      default:
        return intl.formatMessage(messages.next);
    }
  }, [currentStep]);

  const handleNextStep = () => {
    switch (currentStep) {
      case Steps.ONE:
        setCurrentStep(Steps.TWO);
        break;
      case Steps.TWO:
        handleSubmit();
        onClose();
        break;
      default:
        break;
    }
  };

  const StepToRender = manageGroupSteps[currentStep];

  return (
    <Modal
      title={id
        ? <FormattedMessage id='navigation_bar.edit_group' defaultMessage='Edit Group' />
        : <FormattedMessage id='navigation_bar.create_group' defaultMessage='Create Group' />}
      confirmationAction={handleNextStep}
      confirmationText={confirmationText}
      confirmationDisabled={isSubmitting}
      confirmationFullWidth
      onClose={onClickClose}
    >
      <Stack space={2}>
        <StepToRender />
      </Stack>
    </Modal>
  );
};

export default ManageGroupModal;
