import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createSelector } from 'reselect';

import { setupListAdder, resetListAdder } from 'soapbox/actions/lists.ts';
import { CardHeader, CardTitle } from 'soapbox/components/ui/card.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

import NewListForm from '../lists/components/new-list-form.tsx';

import List from './components/list.tsx';

import type { List as ImmutableList } from 'immutable';
import type { RootState } from 'soapbox/store.ts';
import type { List as ListEntity } from 'soapbox/types/entities.ts';

const messages = defineMessages({
  subheading: { id: 'lists.subheading', defaultMessage: 'Your lists' },
  add: { id: 'lists.new.create', defaultMessage: 'Add list' },
});

// hack
const getOrderedLists = createSelector([(state: RootState) => state.lists], lists => {
  if (!lists) {
    return lists;
  }

  return lists.toList().filter(item => !!item).sort((a, b) => (a as ListEntity).title.localeCompare((b as ListEntity).title)) as ImmutableList<ListEntity>;
});

interface IListAdder {
  accountId: string;
  onClose: (type: string) => void;
}

const ListAdder: React.FC<IListAdder> = ({ accountId, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const listIds = useAppSelector((state) => getOrderedLists(state).map(list => list.id));

  useEffect(() => {
    dispatch(setupListAdder(accountId));

    return () => {
      dispatch(resetListAdder());
    };
  }, []);

  const onClickClose = () => {
    onClose('LIST_ADDER');
  };

  return (
    <Modal
      title={<FormattedMessage id='list_adder.header_title' defaultMessage='Add or Remove from Lists' />}
      onClose={onClickClose}
    >
      <AccountContainer id={accountId} withRelationship={false} />

      <br />

      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.add)} />
      </CardHeader>
      <NewListForm />

      <br />

      <CardHeader>
        <CardTitle title={intl.formatMessage(messages.subheading)} />
      </CardHeader>
      <div>
        {listIds.map(ListId => <List key={ListId} listId={ListId} />)}
      </div>
    </Modal>
  );
};

export default ListAdder;
