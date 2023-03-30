import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { submitGroupEditor } from 'soapbox/actions/groups';
import { Modal, Stack } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useDebounce } from 'soapbox/hooks';
import { useGroupValidation } from 'soapbox/hooks/api';

import ConfirmationStep from './steps/confirmation-step';
import DetailsStep from './steps/details-step';
import PrivacyStep from './steps/privacy-step';

const messages = defineMessages({
  next: { id: 'manage_group.next', defaultMessage: 'Next' },
  create: { id: 'manage_group.create', defaultMessage: 'Create' },
  update: { id: 'manage_group.update', defaultMessage: 'Update' },
  done: { id: 'manage_group.done', defaultMessage: 'Done' },
});

enum Steps {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
}

const manageGroupSteps = {
  ONE: PrivacyStep,
  TWO: DetailsStep,
  THREE: ConfirmationStep,
};

interface IManageGroupModal {
  onClose: (type?: string) => void
}

const ManageGroupModal: React.FC<IManageGroupModal> = ({ onClose }) => {
  const intl = useIntl();
  const debounce = useDebounce;
  const dispatch = useAppDispatch();

  const id = useAppSelector((state) => state.group_editor.groupId);
  const [group, setGroup] = useState<any | null>(null);

  const isSubmitting = useAppSelector((state) => state.group_editor.isSubmitting);

  const [currentStep, setCurrentStep] = useState<Steps>(id ? Steps.TWO : Steps.ONE);

  const name = useAppSelector((state) => state.group_editor.displayName);
  const debouncedName = debounce(name, 300);

  const { data: { isValid } } = useGroupValidation(debouncedName);

  const handleClose = () => {
    onClose('MANAGE_GROUP');
  };

  const handleSubmit = () => {
    return dispatch(submitGroupEditor(true));
  };

  const confirmationText = useMemo(() => {
    switch (currentStep) {
      case Steps.THREE:
        return intl.formatMessage(messages.done);
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
        handleSubmit()
          .then((group) => {
            setCurrentStep(Steps.THREE);
            setGroup(group);
          })
          .catch(() => {});
        break;
      case Steps.THREE:
        handleClose();
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
      confirmationDisabled={isSubmitting || (currentStep === Steps.TWO && !isValid)}
      confirmationFullWidth
      onClose={handleClose}
    >
      <Stack space={2}>
        {/* @ts-ignore */}
        <StepToRender group={group} />
      </Stack>
    </Modal>
  );
};

export default ManageGroupModal;
