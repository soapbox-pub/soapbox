import debounce from 'lodash/debounce';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { submitAccountNote } from 'soapbox/actions/account-notes.ts';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Textarea from 'soapbox/components/ui/textarea.tsx';
import Widget from 'soapbox/components/ui/widget.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

import type { Account as AccountEntity } from 'soapbox/schemas/index.ts';
import type { AppDispatch } from 'soapbox/store.ts';

const onSave = debounce(
  (dispatch: AppDispatch, id: string, value: string, callback: () => void) =>
    dispatch(submitAccountNote(id, value)).then(() => callback()),
  900,
);

const messages = defineMessages({
  placeholder: { id: 'account_note.placeholder', defaultMessage: 'Click to add a note' },
  saved: { id: 'generic.saved', defaultMessage: 'Saved' },
});

interface IAccountNotePanel {
  account: AccountEntity;
}

const AccountNotePanel: React.FC<IAccountNotePanel> = ({ account }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const textarea = useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useState<string | undefined>(account.relationship?.note);
  const [saved, setSaved] = useState(false);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    setValue(e.target.value);

    onSave(dispatch, account.id, e.target.value, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  useEffect(() => {
    setValue(account.relationship?.note);
  }, [account.relationship?.note]);

  if (!account) {
    return null;
  }

  return (
    <Widget
      title={<HStack space={2} alignItems='center'>
        <label htmlFor={`account-note-${account.id}`}>
          <FormattedMessage id='account_note.header' defaultMessage='Note' />
        </label>
        {saved && (
          <Text theme='success' tag='span' className='leading-none'>
            <FormattedMessage id='generic.saved' defaultMessage='Saved' />
          </Text>
        )}
      </HStack>}
    >
      <div className='-mx-2'>
        <Textarea
          id={`account-note-${account.id}`}
          theme='transparent'
          placeholder={intl.formatMessage(messages.placeholder)}
          value={value || ''}
          onChange={handleChange}
          ref={textarea}
          autoGrow
        />
      </div>
    </Widget>
  );
};

export default AccountNotePanel;
