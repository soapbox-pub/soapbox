import { List as ImmutableList } from 'immutable';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { translateStatus, undoStatusTranslation } from 'soapbox/actions/statuses';
import { useAppDispatch, useAppSelector, useFeatures, useInstance } from 'soapbox/hooks';
import { isLocal } from 'soapbox/utils/accounts';

import { IconButton, HStack } from './ui';

import type { Account, Status } from 'soapbox/types/entities';

interface ITranslateButton {
  status: Status,
}

const TranslateButton: React.FC<ITranslateButton> = ({ status }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const instance = useInstance();

  const messages = defineMessages({
    translate: { id: 'status.translate', defaultMessage: 'Translate' },
    showOriginal: { id: 'status.show_original', defaultMessage: 'Show original' },
  });

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

  const textStyle = 'text-gray-700 dark:text-gray-600 text-sm';
  const iconStyle = 'text-gray-600 dark:text-gray-400 p-0.5';

  if (status.translation) {
    const languageNames = new Intl.DisplayNames([intl.locale], { type: 'language' });
    const languageName = languageNames.of(status.language!);
    const provider     = status.translation.get('provider');

    return (
      <HStack className={textStyle} space={3} alignItems='center'>
        <IconButton
          className={'pr-3'}
          iconClassName={iconStyle}
          theme='outlined'
          text={intl.formatMessage(messages.showOriginal)}
          src={require('@tabler/icons/language.svg')}
          onClick={handleTranslate}
        />
        <span>
          <FormattedMessage id='status.translated_from_with' defaultMessage='Translated from {lang} using {provider}' values={{ lang: languageName, provider }} />
        </span>
      </HStack>
    );
  }

  return (
    <div className={textStyle}>
      <IconButton
        className={'pr-3'}
        iconClassName={iconStyle}
        theme='outlined'
        text={intl.formatMessage(messages.translate)}
        src={require('@tabler/icons/language.svg')}
        onClick={handleTranslate}
      />
    </div>

  );
};

export default TranslateButton;
