import Emoji from 'soapbox/components/ui/emoji/emoji';

interface IEmojiGraphic {
  emoji: string;
}

/** Large emoji with a background for display purposes (eg breaking up a page). */
const EmojiGraphic: React.FC<IEmojiGraphic> = ({ emoji }) => {
  return (
    <div className='flex items-center justify-center'>
      <div className='rounded-full bg-gray-100 p-8 dark:bg-gray-800'>
        <Emoji className='size-24' emoji={emoji} />
      </div>
    </div>
  );
};

export default EmojiGraphic;