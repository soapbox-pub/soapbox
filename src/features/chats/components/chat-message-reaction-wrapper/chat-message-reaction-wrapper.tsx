import { useState, useEffect, cloneElement } from 'react';

import EmojiSelector from 'soapbox/components/ui/emoji-selector.tsx';
import Portal from 'soapbox/components/ui/portal.tsx';

interface IChatMessageReactionWrapper {
  onOpen(isOpen: boolean): void;
  onSelect(emoji: string): void;
  children: JSX.Element;
}

/**
 * Emoji Reaction Selector
 */
function ChatMessageReactionWrapper(props: IChatMessageReactionWrapper) {
  const { onOpen, onSelect, children } = props;

  const [isOpen, setIsOpen] = useState(false);

  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  const onToggleVisibility = () => setIsOpen((prevValue) => !prevValue);

  useEffect(() => {
    onOpen(isOpen);
  }, [isOpen]);

  return (
    <>
      {cloneElement(children, {
        ref: setReferenceElement,
        onClick: onToggleVisibility,
      })}

      {isOpen && (
        <Portal>
          <EmojiSelector
            visible={isOpen}
            referenceElement={referenceElement}
            onReact={handleSelect}
            onClose={() => setIsOpen(false)}
            offsetOptions={{ mainAxis: 12, crossAxis: -10 }}
            all={false}
          />
        </Portal>
      )}
    </>
  );
}

export default ChatMessageReactionWrapper;