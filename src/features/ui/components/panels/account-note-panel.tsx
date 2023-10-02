import debounce from 'lodash/debounce';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import Textarea from 'react-textarea-autosize';

import { submitAccountNote } from 'soapbox/actions/account-notes';
import { HStack, Text, Widget } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import type { AppDispatch } from 'soapbox/store';
import type { Account as AccountEntity } from 'soapbox/types/entities';

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
      <Textarea
        id={`account-note-${account.id}`}
        className='mx-[-8px] w-full resize-none rounded-md border-0 bg-transparent p-2 text-sm text-gray-800 transition-colors placeholder:text-gray-600 focus:border-0 focus:bg-white focus:shadow-none focus:ring-0 motion-reduce:transition-none dark:text-white dark:placeholder:text-gray-600 focus:dark:bg-primary-900'
        placeholder={intl.formatMessage(messages.placeholder)}
        value={value || ''}
        onChange={handleChange}
        ref={textarea}
      />
    </Widget>
  );
};

export default AccountNotePanel;
