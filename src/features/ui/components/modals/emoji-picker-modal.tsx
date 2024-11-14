import Modal from 'soapbox/components/ui/modal.tsx';
import EmojiPickerDropdown from 'soapbox/features/emoji/components/emoji-picker-dropdown.tsx';
import { Emoji } from 'soapbox/features/emoji/index.ts';

interface IEmojiPickerModal {
  onPickEmoji?: (emoji: Emoji) => void;
}

export const EmojiPickerModal: React.FC<IEmojiPickerModal> = (props) => {
  return (
    <Modal className='flex' theme='transparent'>
      <EmojiPickerDropdown {...props} />
    </Modal>
  );
};

export default EmojiPickerModal;