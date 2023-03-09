import { List as ImmutableList } from 'immutable';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { translateStatus, undoStatusTranslation } from 'soapbox/actions/statuses';
import { useAppDispatch, useAppSelector, useFeatures, useInstance } from 'soapbox/hooks';
import { isLocal } from 'soapbox/utils/accounts';

import { Stack, Button, Text } from './ui';

import type { Account, Status } from 'soapbox/types/entities';

interface ITranslateButton {
  status: Status
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
      <Stack space={3} alignItems='start'>
        <Button
          theme='muted'
          text={<FormattedMessage id='status.show_original' defaultMessage='Show original' />}
          icon={require('@tabler/icons/language.svg')}
          onClick={handleTranslate}
        />
        <Text theme='muted'>
          <FormattedMessage id='status.translated_from_with' defaultMessage='Translated from {lang} using {provider}' values={{ lang: languageName, provider }} />
        </Text>
      </Stack>
    );
  }

  return (
    <div>
      <Button
        theme='muted'
        text={<FormattedMessage id='status.translate' defaultMessage='Translate' />}
        icon={require('@tabler/icons/language.svg')}
        onClick={handleTranslate}
      />
    </div>

  );
};

export default TranslateButton;
