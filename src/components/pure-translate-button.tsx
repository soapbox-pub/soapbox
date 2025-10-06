import languageIcon from '@tabler/icons/outline/language.svg';
import { FormattedMessage, useIntl } from 'react-intl';

import { translateStatus, undoStatusTranslation } from '@/actions/statuses.ts';
import Button from '@/components/ui/button.tsx';
import Stack from '@/components/ui/stack.tsx';
import Text from '@/components/ui/text.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { useInstance } from '@/hooks/useInstance.ts';
import { Status as StatusEntity } from '@/schemas/index.ts';

interface IPureTranslateButton {
  status: StatusEntity;
}

const PureTranslateButton: React.FC<IPureTranslateButton> = ({ status }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const { instance } = useInstance();

  const me = useAppSelector((state) => state.me);

  const {
    allow_remote: allowRemote,
    allow_unauthenticated: allowUnauthenticated,
    source_languages: sourceLanguages,
    target_languages: targetLanguages,
  } = instance.pleroma.metadata.translation;

  const renderTranslate = (me || allowUnauthenticated) && (allowRemote || status.account.local) && ['public', 'unlisted'].includes(status.visibility) && status.content.length > 0 && status.language !== null && intl.locale !== status.language;

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
    const provider     = status.translation.provider;

    return (
      <Stack space={3} alignItems='start'>
        <Button
          theme='muted'
          text={<FormattedMessage id='status.show_original' defaultMessage='Show original' />}
          icon={languageIcon}
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
        icon={languageIcon}
        onClick={handleTranslate}
      />
    </div>

  );
};

export default PureTranslateButton;
