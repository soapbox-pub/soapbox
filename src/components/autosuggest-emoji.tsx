import EmojiComponent from 'soapbox/components/ui/emoji.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import { isCustomEmoji } from 'soapbox/features/emoji/index.ts';
import unicodeMapping from 'soapbox/features/emoji/mapping.ts';

import type { Emoji } from 'soapbox/features/emoji/index.ts';

interface IAutosuggestEmoji {
  emoji: Emoji;
}

const AutosuggestEmoji: React.FC<IAutosuggestEmoji> = ({ emoji }) => {
  let elem: React.ReactNode;

  if (isCustomEmoji(emoji)) {
    elem = <img className='emojione mr-2 block size-4' src={emoji.imageUrl} alt={emoji.colons} />;
  } else {
    const mapping = unicodeMapping[emoji.native] || unicodeMapping[emoji.native.replace(/\uFE0F$/, '')];

    if (!mapping) {
      return null;
    }

    elem = <EmojiComponent emoji={emoji.native} size={16} />;
  }

  return (
    <HStack space={2} alignItems='center' justifyContent='start' className='text-[14px] leading-[18px]' data-testid='emoji'>
      {elem}
      <span>{emoji.colons}</span>
    </HStack>
  );
};

export default AutosuggestEmoji;
