import clsx from 'clsx';
import { TransitionMotion, spring } from 'react-motion';

import { useAnnouncements } from 'soapbox/api/hooks/announcements/index.ts';
import EmojiPickerDropdown from 'soapbox/features/emoji/containers/emoji-picker-dropdown-container.tsx';
import { useSettings } from 'soapbox/hooks/useSettings.ts';

import Reaction from './reaction.tsx';

import type { Emoji, NativeEmoji } from 'soapbox/features/emoji/index.ts';
import type { AnnouncementReaction } from 'soapbox/schemas/index.ts';

interface IReactionsBar {
  announcementId: string;
  reactions: AnnouncementReaction[];
}

const ReactionsBar: React.FC<IReactionsBar> = ({ announcementId, reactions }) => {
  const { reduceMotion } = useSettings();
  const { addReaction } = useAnnouncements();

  const handleEmojiPick = (data: Emoji) => {
    addReaction({ announcementId, name: (data as NativeEmoji).native.replace(/:/g, '') });
  };

  const willEnter = () => ({ scale: reduceMotion ? 1 : 0 });

  const willLeave = () => ({ scale: reduceMotion ? 0 : spring(0, { stiffness: 170, damping: 26 }) });

  const visibleReactions = reactions.filter(x => x.count > 0);

  const styles = visibleReactions.map(reaction => ({
    key: reaction.name,
    data: reaction,
    style: { scale: reduceMotion ? 1 : spring(1, { stiffness: 150, damping: 13 }) },
  }));

  return (
    <TransitionMotion styles={styles} willEnter={willEnter} willLeave={willLeave}>
      {items => (
        <div className={clsx('flex flex-wrap items-center gap-1', { 'reactions-bar--empty': visibleReactions.length === 0 })}>
          {items.map(({ key, data, style }) => (
            <Reaction
              key={key}
              reaction={data}
              style={{ transform: `scale(${style.scale})`, position: style.scale < 0.5 ? 'absolute' : 'static' }}
              announcementId={announcementId}
            />
          ))}

          {visibleReactions.length < 8 && <EmojiPickerDropdown onPickEmoji={handleEmojiPick} />}
        </div>
      )}
    </TransitionMotion>
  );
};

export default ReactionsBar;
