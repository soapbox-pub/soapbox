import bookmarksIcon from '@tabler/icons/outline/bookmarks.svg';
import folderIcon from '@tabler/icons/outline/folder.svg';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { useBookmarkFolders } from 'soapbox/api/hooks';
import List, { ListItem } from 'soapbox/components/list';
import { Column, Emoji, HStack, Icon, Spinner, Stack } from 'soapbox/components/ui';
import { useFeatures } from 'soapbox/hooks';

import NewFolderForm from './components/new-folder-form';


const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
});

const BookmarkFolders: React.FC = () => {
  const intl = useIntl();
  const features = useFeatures();

  const { bookmarkFolders, isFetching } = useBookmarkFolders();

  if (!features.bookmarkFolders) return <Redirect to='/bookmarks/all' />;

  if (isFetching) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <NewFolderForm />

        <List>
          <ListItem
            to='/bookmarks/all'
            label={
              <HStack alignItems='center' space={2}>
                <Icon src={bookmarksIcon} size={20} />
                <span><FormattedMessage id='bookmark_folders.all_bookmarks' defaultMessage='All bookmarks' /></span>
              </HStack>
            }
          />
          {bookmarkFolders?.map((folder) => (
            <ListItem
              key={folder.id}
              to={`/bookmarks/${folder.id}`}
              label={
                <HStack alignItems='center' space={2}>
                  {folder.emoji ? (
                    <Emoji
                      emoji={folder.emoji}
                      src={folder.emoji_url || undefined}
                      className='size-5 flex-none'
                    />
                  ) : <Icon src={folderIcon} size={20} />}
                  <span>{folder.name}</span>
                </HStack>
              }
            />
          ))}
        </List>
      </Stack>
    </Column>
  );
};

export default BookmarkFolders;
