import React from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import { changeComposeSensitivity } from 'soapbox/actions/compose';
import { FormGroup, Checkbox } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';

const messages = defineMessages({
  marked: { id: 'compose_form.sensitive.marked', defaultMessage: 'Media is marked as sensitive' },
  unmarked: { id: 'compose_form.sensitive.unmarked', defaultMessage: 'Media is not marked as sensitive' },
});

interface ISensitiveButton {
  composeId: string,
}

/** Button to mark own media as sensitive. */
const SensitiveButton: React.FC<ISensitiveButton> = ({ composeId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const active = useAppSelector(state => state.compose.get(composeId)!.sensitive === true);
  const disabled = useAppSelector(state => state.compose.get(composeId)!.spoiler === true);

  const onClick = () => {
    dispatch(changeComposeSensitivity(composeId));
  };

  return (
    <div className='px-2.5 py-1'>
      <FormGroup
        labelText={<FormattedMessage id='compose_form.sensitive.hide' defaultMessage='Mark media as sensitive' />}
        labelTitle={intl.formatMessage(active ? messages.marked : messages.unmarked)}
      >
        <Checkbox
          name='mark-sensitive'
          checked={active}
          onChange={onClick}
          disabled={disabled}
        />
      </FormGroup>
    </div>
  );
};

export default SensitiveButton;
