import { supportsPassiveEvents } from 'detect-passive-events';
import React, { useCallback, useEffect, useRef } from 'react';

import { Emoji } from './emoji-picker-dropdown';

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;
const backgroundImageFn = () => require('emoji-datasource/img/twitter/sheets/32.png');

interface IModifierPickerMenu {
  active: boolean
  onSelect: (modifier: number) => void
  onClose: () => void
}

const ModifierPickerMenu: React.FC<IModifierPickerMenu> = ({ active, onSelect, onClose }) => {
  const node = useRef<HTMLDivElement>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    onSelect(+e.currentTarget.getAttribute('data-index')! * 1);
  };

  const handleDocumentClick = useCallback(((e: MouseEvent | TouchEvent) => {
    if (node.current && !node.current.contains(e.target as Node)) {
      onClose();
    }
  }), []);

  const attachListeners = () => {
    document.addEventListener('click', handleDocumentClick, false);
    document.addEventListener('touchend', handleDocumentClick, listenerOptions);
  };

  const removeListeners = () => {
    document.removeEventListener('click', handleDocumentClick, false);
    document.removeEventListener('touchend', handleDocumentClick, listenerOptions as any);
  };

  useEffect(() => {
    return () => {
      removeListeners();
    };
  }, []);

  useEffect(() => {
    if (active) attachListeners();
    else removeListeners();
  }, [active]);

  return (
    <div className='emoji-picker-dropdown__modifiers__menu' style={{ display: active ? 'block' : 'none' }} ref={node}>
      <button onClick={handleClick} data-index={1}>
        <Emoji emoji='thumbsup' set='twitter' size={22} sheetSize={32} skin={1} backgroundImageFn={backgroundImageFn} />
      </button>
      <button onClick={handleClick} data-index={2}>
        <Emoji emoji='thumbsup' set='twitter' size={22} sheetSize={32} skin={2} backgroundImageFn={backgroundImageFn} />
      </button>
      <button onClick={handleClick} data-index={3}>
        <Emoji emoji='thumbsup' set='twitter' size={22} sheetSize={32} skin={3} backgroundImageFn={backgroundImageFn} />
      </button>
      <button onClick={handleClick} data-index={4}>
        <Emoji emoji='thumbsup' set='twitter' size={22} sheetSize={32} skin={4} backgroundImageFn={backgroundImageFn} />
      </button>
      <button onClick={handleClick} data-index={5}>
        <Emoji emoji='thumbsup' set='twitter' size={22} sheetSize={32} skin={5} backgroundImageFn={backgroundImageFn} />
      </button>
      <button onClick={handleClick} data-index={6}>
        <Emoji emoji='thumbsup' set='twitter' size={22} sheetSize={32} skin={6} backgroundImageFn={backgroundImageFn} />
      </button>
    </div>
  );
};

export default ModifierPickerMenu;
