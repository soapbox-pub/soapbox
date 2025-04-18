import languageIcon from '@tabler/icons/outline/language.svg';
import { FormattedMessage, useIntl } from 'react-intl';

import { translateStatus, undoStatusTranslation } from 'soapbox/actions/statuses.ts';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';

import type { Status } from 'soapbox/types/entities.ts';

interface ITranslateButton {
  status: Status;
}

const TranslateButton: React.FC<ITranslateButton> = ({ status }) => {
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

  const handleTranslate: React.MouseEventHandler<HTMLDivElement> = (e) => {
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
      <Stack alignItems='start'>
        <HStack onClick={handleTranslate} space={0.5} alignItems='center' justifyContent='start' className='text-primary-500 hover:cursor-pointer'>
          <Icon src={languageIcon} size={14} />
          <Text className='!text-primary-500'>
            <FormattedMessage id='status.show_original' defaultMessage='Show original' />
          </Text>
        </HStack>
        <Text theme='muted'>
          <FormattedMessage id='status.translated_from_with' defaultMessage='Translated from {lang} using {provider}' values={{ lang: languageName, provider }} />
        </Text>
      </Stack>
    );
  }

  return (
    <Stack alignItems='start'>
      <HStack onClick={handleTranslate} space={0.5} alignItems='center' justifyContent='start' className='text-primary-500 hover:cursor-pointer'>
        <Icon src={languageIcon} size={14} />
        <Text className='!text-primary-500'>
          <FormattedMessage id='status.translate' defaultMessage='Translate' />
        </Text>
      </HStack>
    </Stack>

  );
};

export default TranslateButton;
