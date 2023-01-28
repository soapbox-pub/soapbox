import React from 'react';
import { FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { Button } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

const ComposeButton = () => {
  const dispatch = useAppDispatch();
  const onOpenCompose = () => dispatch(openModal('COMPOSE'));

  return (
    <Button
      theme='accent'
      icon={require('@tabler/icons/pencil-plus.svg')}
      size='lg'
      onClick={onOpenCompose}
      block
    >
      <FormattedMessage id='navigation.compose' defaultMessage='Compose' />
    </Button>
  );
};

export default ComposeButton;
