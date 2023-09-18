import React, { useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
// @ts-ignore
import Overlay from 'react-overlays/lib/Overlay';

import ForkAwesomeIcon from 'soapbox/components/fork-awesome-icon';

import IconPickerMenu from './icon-picker-menu';

const messages = defineMessages({
  emoji: { id: 'icon_button.label', defaultMessage: 'Select icon' },
});

interface IIconPickerDropdown {
  value: string
  onPickIcon: (icon: string) => void
}

const IconPickerDropdown: React.FC<IIconPickerDropdown> = ({ value, onPickIcon }) => {
  const intl = useIntl();

  const [active, setActive] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>();

  const target = useRef(null);

  const onShowDropdown: React.KeyboardEventHandler<HTMLDivElement> = ({ target }) => {
    setActive(true);

    const { top } = (target as any).getBoundingClientRect();
    setPlacement(top * 2 < innerHeight ? 'bottom' : 'top');
  };

  const onHideDropdown = () => {
    setActive(false);
  };

  const onToggle: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    if (!e.key || e.key === 'Enter') {
      if (active) {
        onHideDropdown();
      } else {
        onShowDropdown(e);
      }
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Escape') {
      onHideDropdown();
    }
  };

  const title = intl.formatMessage(messages.emoji);
  const forkAwesomeIcons = require('../forkawesome.json');

  return (
    <div onKeyDown={handleKeyDown}>
      <div
        ref={target}
        className='flex h-[38px] w-[38px] cursor-pointer items-center justify-center text-lg'
        title={title}
        aria-label={title}
        aria-expanded={active}
        role='button'
        onClick={onToggle as any as React.MouseEventHandler<HTMLDivElement>}
        onKeyDown={onToggle}
        tabIndex={0}
      >
        <ForkAwesomeIcon id={value} />
      </div>

      <Overlay show={active} placement={placement} target={target.current}>
        <IconPickerMenu
          icons={forkAwesomeIcons}
          onClose={onHideDropdown}
          onPick={onPickIcon}
        />
      </Overlay>
    </div>
  );
};

export default IconPickerDropdown;
