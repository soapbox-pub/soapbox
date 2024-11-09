import dotsVerticalIcon from '@tabler/icons/outline/dots-vertical.svg';
import editIcon from '@tabler/icons/outline/edit.svg';
import trashIcon from '@tabler/icons/outline/trash.svg';
import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import debounce from 'lodash/debounce';
import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchBookmarkedStatuses, expandBookmarkedStatuses } from 'soapbox/actions/bookmarks';
import { openModal } from 'soapbox/actions/modals';
import { useBookmarkFolder, useDeleteBookmarkFolder } from 'soapbox/api/hooks';
import DropdownMenu from 'soapbox/components/dropdown-menu';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import StatusList from 'soapbox/components/status-list';
import { Column } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch, useTheme } from 'soapbox/hooks';
import { useIsMobile } from 'soapbox/hooks/useIsMobile';
import toast from 'soapbox/toast';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  editFolder: { id: 'bookmarks.edit_folder', defaultMessage: 'Edit folder' },
  deleteFolder: { id: 'bookmarks.delete_folder', defaultMessage: 'Delete folder' },
  deleteFolderHeading: { id: 'confirmations.delete_bookmark_folder.heading', defaultMessage: 'Delete "{name}" folder?' },
  deleteFolderMessage: { id: 'confirmations.delete_bookmark_folder.message', defaultMessage: 'Are you sure you want to delete the folder? The bookmarks will still be stored.' },
  deleteFolderConfirm: { id: 'confirmations.delete_bookmark_folder.confirm', defaultMessage: 'Delete folder' },
  deleteFolderSuccess: { id: 'bookmarks.delete_folder.success', defaultMessage: 'Folder deleted' },
  deleteFolderFail: { id: 'bookmarks.delete_folder.fail', defaultMessage: 'Failed to delete folder' },
});

const handleLoadMore = debounce((dispatch, folderId) => {
  dispatch(expandBookmarkedStatuses(folderId));
}, 300, { leading: true });

interface IBookmarks {
  params?: {
    id?: string;
  };
}

const Bookmarks: React.FC<IBookmarks> = ({ params }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const folderId = params?.id;

  const { bookmarkFolder: folder } = useBookmarkFolder(folderId);
  const { deleteBookmarkFolder } = useDeleteBookmarkFolder();

  const bookmarksKey = folderId ? `bookmarks:${folderId}` : 'bookmarks';

  const statusIds = useAppSelector((state) => state.status_lists.get(bookmarksKey)?.items || ImmutableOrderedSet<string>());
  const isLoading = useAppSelector((state) => state.status_lists.get(bookmarksKey)?.isLoading === true);
  const hasMore = useAppSelector((state) => !!state.status_lists.get(bookmarksKey)?.next);

  useEffect(() => {
    dispatch(fetchBookmarkedStatuses(folderId));
  }, [folderId]);

  const handleRefresh = () => {
    return dispatch(fetchBookmarkedStatuses(folderId));
  };

  const handleEditFolder = () => {
    dispatch(openModal('EDIT_BOOKMARK_FOLDER', { folderId }));
  };

  const handleDeleteFolder = () => {
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteFolderHeading, { name: folder?.name }),
      message: intl.formatMessage(messages.deleteFolderMessage),
      confirm: intl.formatMessage(messages.deleteFolderConfirm),
      onConfirm: () => {
        deleteBookmarkFolder(folderId!, {
          onSuccess() {
            toast.success(messages.deleteFolderSuccess);
            history.push('/bookmarks');
          },
          onError() {
            toast.error(messages.deleteFolderFail);
          },
        });
      },
    }));
  };

  const emptyMessage = folderId
    ? <FormattedMessage id='empty_column.bookmarks.folder' defaultMessage="You don't have any bookmarks in this folder yet. When you add one, it will show up here." />
    : <FormattedMessage id='empty_column.bookmarks' defaultMessage="You don't have any bookmarks yet. When you add one, it will show up here." />;

  const items = folderId ? [
    {
      text: intl.formatMessage(messages.editFolder),
      action: handleEditFolder,
      icon: editIcon,
    },
    {
      text: intl.formatMessage(messages.deleteFolder),
      action: handleDeleteFolder,
      icon: trashIcon,
    },
  ] : [];

  return (
    <Column
      label={folder ? folder.name : intl.formatMessage(messages.heading)}
      action={
        <DropdownMenu items={items} src={dotsVerticalIcon} />
      }
      transparent={!isMobile}
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <StatusList
          className='black:p-4 black:sm:p-5'
          statusIds={statusIds}
          scrollKey='bookmarked_statuses'
          hasMore={hasMore}
          isLoading={typeof isLoading === 'boolean' ? isLoading : true}
          onLoadMore={() => handleLoadMore(dispatch, folderId)}
          emptyMessage={emptyMessage}
          divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
        />
      </PullToRefresh>
    </Column>
  );
};

export default Bookmarks;
