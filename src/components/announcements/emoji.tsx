import { useCustomEmojis } from 'soapbox/api/hooks/useCustomEmojis.ts';
import NativeEmoji from 'soapbox/components/ui/emoji.tsx';
import { useSettings } from 'soapbox/hooks/useSettings.ts';

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
        className='emojione m-0 block'
        alt={shortCode}
        title={shortCode}
        src={filename as string}
      />
    );
  }

  return <NativeEmoji emoji={emoji} />;
};

export default Emoji;
