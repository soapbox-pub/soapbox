import { useCustomEmojis } from '@/api/hooks/useCustomEmojis.ts';
import NativeEmoji from '@/components/ui/emoji.tsx';
import { useSettings } from '@/hooks/useSettings.ts';

interface IEmoji {
  emoji: string;
  hovered: boolean;
}

const Emoji: React.FC<IEmoji> = ({ emoji, hovered }) => {
  const { autoPlayGif } = useSettings();
  const { customEmojis } = useCustomEmojis();

  const custom = customEmojis.find((x) => x.shortcode === emoji);

  if (custom) {
    const filename  = (autoPlayGif || hovered) ? custom.url : custom.static_url;
    const shortCode = `:${emoji}:`;

    return (
      <img
        draggable='false'
        className='m-0 block'
        alt={shortCode}
        title={shortCode}
        src={filename as string}
      />
    );
  }

  return <NativeEmoji emoji={emoji} />;
};

export default Emoji;
