import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { translateStatus, undoStatusTranslation } from 'soapbox/actions/statuses';
import { useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks';

import { Stack } from './ui';

import type { Status } from 'soapbox/types/entities';

interface ITranslateButton {
  status: Status,
}

const TranslateButton: React.FC<ITranslateButton> = ({ status }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();

  const me = useAppSelector((state) => state.me);

  const renderTranslate = me && ['public', 'unlisted'].includes(status.visibility) && status.contentHtml.length > 0 && status.language !== null && intl.locale !== status.language;

  const handleTranslate: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (status.translation) {
      dispatch(undoStatusTranslation(status.id));
    } else {
      dispatch(translateStatus(status.id, intl.locale));
    }
  };

  if (!features.translations || !renderTranslate) return null;

  if (status.translation) {
    const languageNames = new Intl.DisplayNames([intl.locale], { type: 'language' });
    const languageName = languageNames.of(status.language!);
    const provider     = status.translation.get('provider');

    return (
      <Stack className='text-gray-700 dark:text-gray-600 text-sm' alignItems='start'>
        <FormattedMessage id='status.translated_from_with' defaultMessage='Translated from {lang} using {provider}' values={{ lang: languageName, provider }} />

        <button className='text-primary-600 dark:text-accent-blue hover:text-primary-700 dark:hover:text-accent-blue hover:underline' onClick={handleTranslate}>
          <FormattedMessage id='status.show_original' defaultMessage='Show original' />
        </button>
      </Stack>
    );
  }

  return (
    <button className='text-primary-600 dark:text-accent-blue hover:text-primary-700 dark:hover:text-accent-blue text-left text-sm hover:underline' onClick={handleTranslate}>
      <FormattedMessage id='status.translate' defaultMessage='Translate' />
    </button>
  );
};

export default TranslateButton;
