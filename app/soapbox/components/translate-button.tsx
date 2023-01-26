import { List as ImmutableList } from 'immutable';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { translateStatus, undoStatusTranslation } from 'soapbox/actions/statuses';
import { useAppDispatch, useAppSelector, useFeatures, useInstance } from 'soapbox/hooks';
import { isLocal } from 'soapbox/utils/accounts';

import { Icon, Stack } from './ui';

import type { Account, Status } from 'soapbox/types/entities';

interface ITranslateButton {
  status: Status,
}

const TranslateButton: React.FC<ITranslateButton> = ({ status }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const instance = useInstance();

  const me = useAppSelector((state) => state.me);

  const allowUnauthenticated = instance.pleroma.getIn(['metadata', 'translation', 'allow_unauthenticated'], false);
  const allowRemote = instance.pleroma.getIn(['metadata', 'translation', 'allow_remote'], true);

  const sourceLanguages = instance.pleroma.getIn(['metadata', 'translation', 'source_languages']) as ImmutableList<string>;
  const targetLanguages = instance.pleroma.getIn(['metadata', 'translation', 'target_languages']) as ImmutableList<string>;

  const renderTranslate = (me || allowUnauthenticated) && (allowRemote || isLocal(status.account as Account)) && ['public', 'unlisted'].includes(status.visibility) && status.contentHtml.length > 0 && status.language !== null && intl.locale !== status.language;

  const supportsLanguages = (!sourceLanguages || sourceLanguages.includes(status.language!)) && (!targetLanguages || targetLanguages.includes(intl.locale));

  const handleTranslate: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (status.translation) {
      dispatch(undoStatusTranslation(status.id));
    } else {
      dispatch(translateStatus(status.id, intl.locale));
    }
  };

  if (!features.translations || !renderTranslate || !supportsLanguages) return null;

  if (status.translation) {
    const languageNames = new Intl.DisplayNames([intl.locale], { type: 'language' });
    const languageName = languageNames.of(status.language!);
    const provider     = status.translation.get('provider');

    return (
      <Stack className='text-gray-700 dark:text-gray-600 text-sm' alignItems='start'>
        <FormattedMessage id='status.translated_from_with' defaultMessage='Translated from {lang} using {provider}' values={{ lang: languageName, provider }} />

        <button className='flex items-center gap-0.5 text-primary-600 dark:text-accent-blue hover:text-primary-700 dark:hover:text-accent-blue hover:underline' onClick={handleTranslate}>
          <Icon className='h-5 w-5 stroke-[1.25]' src={require('@tabler/icons/language.svg')} strokeWidth={1.25} />
          <FormattedMessage id='status.show_original' defaultMessage='Show original' />
        </button>
      </Stack>
    );
  }

  return (
    <button className='flex items-center gap-0.5 text-primary-600 dark:text-accent-blue hover:text-primary-700 dark:hover:text-accent-blue text-start text-sm hover:underline' onClick={handleTranslate}>
      <Icon className='h-5 w-5' src={require('@tabler/icons/language.svg')} strokeWidth={1.25} />
      <FormattedMessage id='status.translate' defaultMessage='Translate' />
    </button>
  );
};

export default TranslateButton;
