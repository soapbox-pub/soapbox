import alertTriangleIcon from '@tabler/icons/outline/alert-triangle.svg';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeSpoilerness } from 'soapbox/actions/compose';
import { useAppDispatch, useCompose } from 'soapbox/hooks';

import ComposeFormButton from './compose-form-button';

const messages = defineMessages({
  marked: { id: 'compose_form.spoiler.marked', defaultMessage: 'Text is hidden behind warning' },
  unmarked: { id: 'compose_form.spoiler.unmarked', defaultMessage: 'Text is not hidden' },
});

interface ISpoilerButton {
  composeId: string;
}

const SpoilerButton: React.FC<ISpoilerButton> = ({ composeId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const active = useCompose(composeId).spoiler;

  const onClick = () =>
    dispatch(changeComposeSpoilerness(composeId));

  return (
    <ComposeFormButton
      icon={alertTriangleIcon}
      title={intl.formatMessage(active ? messages.marked : messages.unmarked)}
      active={active}
      onClick={onClick}
    />
  );
};

export default SpoilerButton;
