import clsx from 'clsx';
import { supportsPassiveEvents } from 'detect-passive-events';
import React, { useCallback, useEffect, useRef } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { Text } from 'soapbox/components/ui';

const messages = defineMessages({
  emoji: { id: 'icon_button.label', defaultMessage: 'Select icon' },
});

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;


interface IIconPickerMenu {
  icons: Record<string, Array<string>>
  onClose: () => void
  onPick: (icon: string) => void
  style?: React.CSSProperties
}

const IconPickerMenu: React.FC<IIconPickerMenu> = ({ icons, onClose, onPick, style }) => {
  const intl = useIntl();

  const node = useRef<HTMLDivElement | null>(null);

  const handleDocumentClick = useCallback((e: MouseEvent | TouchEvent) => {
    if (node.current && !node.current.contains(e.target as Node)) {
      onClose();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick, false);
    document.addEventListener('touchend', handleDocumentClick, listenerOptions);

    return () => {
      document.removeEventListener('click', handleDocumentClick, false);
      document.removeEventListener('touchend', handleDocumentClick, listenerOptions as any);

    };
  }, []);

  const setRef = (c: HTMLDivElement) => {
    node.current = c;

    if (!c) return;

    // Nice and dirty hack to display the icons
    c.querySelectorAll('button.emoji-mart-emoji > img').forEach(elem => {
      const newIcon = document.createElement('span');
      newIcon.innerHTML = `<i class="fa fa-${(elem.parentNode as any).getAttribute('title')} fa-hack"></i>`;
      (elem.parentNode as any).replaceChild(newIcon, elem);
    });
  };

  const handleClick = (icon: string) => {
    onClose();
    onPick(icon);
  };

  const renderIcon = (icon: string) => {
    const name = icon.replace('fa fa-', '');

    return (
      <li key={icon} className='col-span-1 inline-block'>
        <button
          className='flex items-center justify-center rounded-full p-1.5 hover:bg-gray-50 dark:hover:bg-primary-800'
          aria-label={name}
          title={name}
          onClick={() => handleClick(name)}
        >
          <i className={clsx(icon, 'h-[1.375rem] w-[1.375rem] text-lg leading-[1.15]')} />
        </button>
      </li>
    );
  };

  const title = intl.formatMessage(messages.emoji);

  return (
    <div
      className={clsx('absolute z-[101] -my-0.5')}
      style={{ transform: 'translateX(calc(-1 * env(safe-area-inset-right)))', ...style }}
      ref={setRef}
    >
      <div className='h-[270px] overflow-x-hidden overflow-y-scroll rounded bg-white p-1.5 text-gray-900 dark:bg-primary-900 dark:text-gray-100' aria-label={title}>
        <Text className='px-1.5 py-1'><FormattedMessage id='icon_button.icons' defaultMessage='Icons' /></Text>
        <ul className='grid grid-cols-8'>
          {Object.values(icons).flat().map(icon => renderIcon(icon))}
        </ul>
      </div>
    </div>
  );
};

export default IconPickerMenu;
