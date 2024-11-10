import bookmarksIcon from '@tabler/icons/outline/bookmarks.svg';
import folderIcon from '@tabler/icons/outline/folder.svg';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { bookmark } from 'soapbox/actions/interactions.ts';
import { useBookmarkFolders } from 'soapbox/api/hooks/index.ts';
import { RadioGroup, RadioItem } from 'soapbox/components/radio.tsx';
import Emoji from 'soapbox/components/ui/emoji.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import NewFolderForm from 'soapbox/features/bookmark-folders/components/new-folder-form.tsx';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks/index.ts';
import { makeGetStatus } from 'soapbox/selectors/index.ts';

import type { Status as StatusEntity } from 'soapbox/types/entities.ts';

interface ISelectBookmarkFolderModal {
  statusId: string;
  onClose: (type: string) => void;
}

const SelectBookmarkFolderModal: React.FC<ISelectBookmarkFolderModal> = ({ statusId, onClose }) => {
  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector(state => getStatus(state, { id: statusId })) as StatusEntity;
  const dispatch = useAppDispatch();

  const [selectedFolder, setSelectedFolder] = useState(status.pleroma.get('bookmark_folder'));

  const { isFetching, bookmarkFolders } = useBookmarkFolders();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const folderId = e.target.value;
    setSelectedFolder(folderId);

    dispatch(bookmark(status, folderId)).then(() => {
      onClose('SELECT_BOOKMARK_FOLDER');
    }).catch(() => {});
  };

  const onClickClose = () => {
    onClose('SELECT_BOOKMARK_FOLDER');
  };

  const items = [
    <RadioItem
      label={
        <HStack alignItems='center' space={2}>
          <Icon src={bookmarksIcon} size={20} />
          <span><FormattedMessage id='bookmark_folders.all_bookmarks' defaultMessage='All bookmarks' /></span>
        </HStack>
      }
      checked={selectedFolder === null}
      value={''}
    />,
  ];

  if (!isFetching) {
    items.push(...(bookmarkFolders.map((folder) => (
      <RadioItem
        key={folder.id}
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
        checked={selectedFolder === folder.id}
        value={folder.id}
      />
    ))));
  }

  const body = isFetching ? <Spinner /> : (
    <Stack space={4}>
      <NewFolderForm />

      <RadioGroup onChange={onChange}>
        {items}
      </RadioGroup>
    </Stack>
  );

  return (
    <Modal
      title={<FormattedMessage id='select_bookmark_folder_modal.header_title' defaultMessage='Select folder' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export default SelectBookmarkFolderModal;
