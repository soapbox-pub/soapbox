import listIcon from '@tabler/icons/outline/list.svg';
import pencilIcon from '@tabler/icons/outline/pencil.svg';
import trashIcon from '@tabler/icons/outline/trash.svg';
import { useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { createSelector } from 'reselect';

import { deleteList, fetchLists } from 'soapbox/actions/lists.ts';
import { openModal } from 'soapbox/actions/modals.ts';
import Icon from 'soapbox/components/icon.tsx';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

import NewListForm from './components/new-list-form.tsx';

import type { RootState } from 'soapbox/store.ts';

const messages = defineMessages({
  heading: { id: 'column.lists', defaultMessage: 'Lists' },
  subheading: { id: 'lists.subheading', defaultMessage: 'Your lists' },
  add: { id: 'lists.new.create', defaultMessage: 'Add list' },
  deleteHeading: { id: 'confirmations.delete_list.heading', defaultMessage: 'Delete list' },
  deleteMessage: { id: 'confirmations.delete_list.message', defaultMessage: 'Are you sure you want to permanently delete this list?' },
  deleteConfirm: { id: 'confirmations.delete_list.confirm', defaultMessage: 'Delete' },
  editList: { id: 'lists.edit', defaultMessage: 'Edit list' },
  deleteList: { id: 'lists.delete', defaultMessage: 'Delete list' },
});

const getOrderedLists = createSelector([(state: RootState) => state.lists], lists => {
  if (!lists) {
    return lists;
  }

  return lists.toList().filter((item) => !!item).sort((a: any, b: any) => a.get('title').localeCompare(b.get('title')));
});

const Lists: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const lists = useAppSelector((state) => getOrderedLists(state));

  useEffect(() => {
    dispatch(fetchLists());
  }, []);

  if (!lists) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const handleEditClick = (id: number) => (e: React.MouseEvent) => {
    e.preventDefault();

    dispatch(openModal('LIST_EDITOR', { listId: id }));
  };

  const handleDeleteClick = (id: number) => (e: React.MouseEvent) => {
    e.preventDefault();

    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => {
        dispatch(deleteList(id));
      },
    }));
  };

  const emptyMessage = <FormattedMessage id='empty_column.lists' defaultMessage="You don't have any lists yet. When you create one, it will show up here." />;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='space-y-4'>
        <NewListForm />

        <ScrollableList
          scrollKey='lists'
          emptyMessage={emptyMessage}
          itemClassName='py-2'
        >
          {lists.map((list: any) => (
            <Link key={list.id} to={`/list/${list.id}`} className='flex items-center gap-1.5 rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800'>
              <Icon src={listIcon} />
              <span className='grow'>
                {list.title}
              </span>
              <IconButton iconClassName='h-5 w-5 text-gray-700 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-500' src={pencilIcon} onClick={handleEditClick(list.id)} title={intl.formatMessage(messages.editList)} />
              <IconButton iconClassName='h-5 w-5 text-gray-700 hover:text-gray-800 dark:text-gray-600 dark:hover:text-gray-500' src={trashIcon} onClick={handleDeleteClick(list.id)} title={intl.formatMessage(messages.deleteList)} />
            </Link>
          ))}
        </ScrollableList>
      </div>
    </Column>
  );
};

export default Lists;
