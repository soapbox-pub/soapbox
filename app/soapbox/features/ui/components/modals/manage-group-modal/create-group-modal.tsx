import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { Modal, Stack } from 'soapbox/components/ui';
import { useDebounce } from 'soapbox/hooks';
import { useCreateGroup, useGroupValidation, type CreateGroupParams } from 'soapbox/hooks/api';
import { type Group } from 'soapbox/schemas';

import ConfirmationStep from './steps/confirmation-step';
import DetailsStep from './steps/details-step';
import PrivacyStep from './steps/privacy-step';

const messages = defineMessages({
  next: { id: 'manage_group.next', defaultMessage: 'Next' },
  create: { id: 'manage_group.create', defaultMessage: 'Create' },
  done: { id: 'manage_group.done', defaultMessage: 'Done' },
});

enum Steps {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
}

interface ICreateGroupModal {
  onClose: (type?: string) => void
}

const CreateGroupModal: React.FC<ICreateGroupModal> = ({ onClose }) => {
  const intl = useIntl();
  const debounce = useDebounce;

  const [group, setGroup] = useState<Group | null>(null);
  const [params, setParams] = useState<CreateGroupParams>({});
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.ONE);

  const { createGroup, isSubmitting } = useCreateGroup();

  const debouncedName = debounce(params.display_name || '', 300);
  const { data: { isValid } } = useGroupValidation(debouncedName);

  const handleClose = () => {
    onClose('MANAGE_GROUP');
  };

  const confirmationText = useMemo(() => {
    switch (currentStep) {
      case Steps.THREE:
        return intl.formatMessage(messages.done);
      case Steps.TWO:
        return intl.formatMessage(messages.create);
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
        createGroup(params, {
          onSuccess(group) {
            setCurrentStep(Steps.THREE);
            setGroup(group);
          },
        });
        break;
      case Steps.THREE:
        handleClose();
        break;
      default:
        break;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case Steps.ONE:
        return <PrivacyStep params={params} onChange={setParams} />;
      case Steps.TWO:
        return <DetailsStep params={params} onChange={setParams} />;
      case Steps.THREE:
        return <ConfirmationStep group={group!} />;
    }
  };

  return (
    <Modal
      title={<FormattedMessage id='navigation_bar.create_group' defaultMessage='Create Group' />}
      confirmationAction={handleNextStep}
      confirmationText={confirmationText}
      confirmationDisabled={isSubmitting || (currentStep === Steps.TWO && !isValid)}
      confirmationFullWidth
      onClose={handleClose}
    >
      <Stack space={2}>
        {renderStep()}
      </Stack>
    </Modal>
  );
};

export default CreateGroupModal;
