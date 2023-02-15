import clsx from 'clsx';
import { supportsPassiveEvents } from 'detect-passive-events';
// @ts-ignore
import Picker from 'emoji-mart/dist-es/components/picker/picker';
import React, { useCallback, useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  emoji: { id: 'icon_button.label', defaultMessage: 'Select icon' },
  emoji_search: { id: 'emoji_button.search', defaultMessage: 'Search…' },
  emoji_not_found: { id: 'icon_button.not_found', defaultMessage: 'No icons!! (╯°□°）╯︵ ┻━┻' },
  custom: { id: 'icon_button.icons', defaultMessage: 'Icons' },
  search_results: { id: 'emoji_button.search_results', defaultMessage: 'Search results' },
});

const backgroundImageFn = () => '';
const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

const categoriesSort = ['custom'];

interface IIconPickerMenu {
  customEmojis: Record<string, Array<string>>
  onClose: () => void
  onPick: any
  style?: React.CSSProperties
}

const IconPickerMenu: React.FC<IIconPickerMenu> = ({ customEmojis, onClose, onPick, style }) => {
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

  const getI18n = () => {

    return {
      search: intl.formatMessage(messages.emoji_search),
      notfound: intl.formatMessage(messages.emoji_not_found),
      categories: {
        search: intl.formatMessage(messages.search_results),
        custom: intl.formatMessage(messages.custom),
      },
    };
  };

  const handleClick = (emoji: Record<string, any>) => {
    emoji.native = emoji.colons;

    onClose();
    onPick(emoji);
  };

  const buildIcons = () => {
    const emojis: Record<string, any> = [];

    Object.values(customEmojis).forEach((category) => {
      category.forEach((icon) => {
        const name = icon.replace('fa fa-', '');
        if (icon !== 'email' && icon !== 'memo') {
          emojis.push({
            id: name,
            name,
            short_names: [name],
            emoticons: [],
            keywords: [name],
            imageUrl: '',
          });
        }
      });
    });

    return emojis;
  };

  const data = { compressed: true, categories: [], aliases: [], emojis: [] };
  const title = intl.formatMessage(messages.emoji);

  return (
    <div className={clsx('font-icon-picker emoji-picker-dropdown__menu')} style={style} ref={setRef}>
      <Picker
        perLine={8}
        emojiSize={22}
        include={categoriesSort}
        sheetSize={32}
        custom={buildIcons()}
        color=''
        emoji=''
        set=''
        title={title}
        i18n={getI18n()}
        onClick={handleClick}
        showPreview={false}
        backgroundImageFn={backgroundImageFn}
        emojiTooltip
        noShowAnchors
        data={data}
      />
    </div>
  );
};

export default IconPickerMenu;
