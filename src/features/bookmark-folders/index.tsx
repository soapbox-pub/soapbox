import bookmarksIcon from '@tabler/icons/outline/bookmarks.svg';
import folderIcon from '@tabler/icons/outline/folder.svg';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { useBookmarkFolders } from 'soapbox/api/hooks/index.ts';
import List, { ListItem } from 'soapbox/components/list.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Emoji from 'soapbox/components/ui/emoji.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';

import NewFolderForm from './components/new-folder-form.tsx';


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
          {bookmarkFolders?.map((folder) => {
            let icon = <Icon src={folderIcon} size={20} />;

            if (folder.emoji_url) {
              icon = <img src={folder.emoji_url} alt={folder.emoji} className='size-5' />;
            } else if (folder.emoji) {
              icon = <Emoji size={20} emoji={folder.emoji} />;
            }

            return (
              <ListItem
                key={folder.id}
                to={`/bookmarks/${folder.id}`}
                label={
                  <HStack alignItems='center' space={2}>
                    <div className='flex-none'>{icon}</div>
                    <span>{folder.name}</span>
                  </HStack>
                }
              />
            );
          })}
        </List>
      </Stack>
    </Column>
  );
};

export default BookmarkFolders;
