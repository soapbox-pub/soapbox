import React, { useState, useEffect } from 'react';

import EmojiSelector from '../../../../components/ui/emoji-selector/emoji-selector';

interface IChatMessageReactionWrapper {
  onOpen(isOpen: boolean): void
  onSelect(emoji: string): void
  children: JSX.Element
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
    <React.Fragment>
      {React.cloneElement(children, {
        ref: setReferenceElement,
        onClick: onToggleVisibility,
      })}

      <EmojiSelector
        visible={isOpen}
        referenceElement={referenceElement}
        onReact={handleSelect}
        onClose={() => setIsOpen(false)}
        all={false}
      />
    </React.Fragment>
  );
}

export default ChatMessageReactionWrapper;