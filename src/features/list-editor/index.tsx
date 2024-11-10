import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { setupListEditor, resetListEditor } from 'soapbox/actions/lists.ts';
import { CardHeader, CardTitle, Modal } from 'soapbox/components/ui/index.ts';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks/index.ts';

import Account from './components/account.tsx';
import EditListForm from './components/edit-list-form.tsx';
import Search from './components/search.tsx';

const messages = defineMessages({
  changeTitle: { id: 'lists.edit.submit', defaultMessage: 'Change title' },
  addToList: { id: 'lists.account.add', defaultMessage: 'Add to list' },
  removeFromList: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
});

interface IListEditor {
  listId: string;
  onClose: (type: string) => void;
}

const ListEditor: React.FC<IListEditor> = ({ listId, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const accountIds = useAppSelector((state) => state.listEditor.accounts.items);
  const searchAccountIds = useAppSelector((state) => state.listEditor.suggestions.items);

  useEffect(() => {
    dispatch(setupListEditor(listId));

    return () => {
      dispatch(resetListEditor());
    };
  }, []);

  const onClickClose = () => {
    onClose('LIST_ADDER');
  };

  return (
    <Modal
      title={<FormattedMessage id='lists.edit' defaultMessage='Edit list' />}
      onClose={onClickClose}
    >
      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.changeTitle)} />
      </CardHeader>
      <EditListForm />
      <br />

      {accountIds.size > 0 && (
        <div>
          <CardHeader>
            <CardTitle title={intl.formatMessage(messages.removeFromList)} />
          </CardHeader>
          <div className='max-h-48 overflow-y-auto'>
            {accountIds.map(accountId => <Account key={accountId} accountId={accountId} />)}
          </div>
        </div>
      )}

      <br />
      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.addToList)} />
      </CardHeader>
      <Search />
      <div className='max-h-48 overflow-y-auto'>
        {searchAccountIds.map(accountId => <Account key={accountId} accountId={accountId} />)}
      </div>
    </Modal>
  );
};

export default ListEditor;
