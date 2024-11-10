import clsx from 'clsx';
import { forwardRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeComposeSpoilerness, changeComposeSpoilerText } from 'soapbox/actions/compose.ts';
import AutosuggestInput, { IAutosuggestInput } from 'soapbox/components/autosuggest-input.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useCompose } from 'soapbox/hooks/useCompose.ts';

const messages = defineMessages({
  title: { id: 'compose_form.spoiler_title', defaultMessage: 'Sensitive content' },
  placeholder: { id: 'compose_form.spoiler_placeholder', defaultMessage: 'Write your warning here (optional)' },
  remove: { id: 'compose_form.spoiler_remove', defaultMessage: 'Remove sensitive' },
});

interface ISpoilerInput extends Pick<IAutosuggestInput, 'onSuggestionsFetchRequested' | 'onSuggestionsClearRequested' | 'onSuggestionSelected'> {
  composeId: string extends 'default' ? never : string;
}

/** Text input for content warning in composer. */
const SpoilerInput = forwardRef<AutosuggestInput, ISpoilerInput>(({
  composeId,
  onSuggestionsFetchRequested,
  onSuggestionsClearRequested,
  onSuggestionSelected,
}, ref) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const compose = useCompose(composeId);

  const handleChangeSpoilerText: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    dispatch(changeComposeSpoilerText(composeId, e.target.value));
  };

  const handleRemove = () => {
    dispatch(changeComposeSpoilerness(composeId));
  };

  return (
    <Stack
      space={4}
      className={clsx({
        'relative transition-height': true,
        'hidden': !compose.spoiler,
      })}
    >
      <Divider />

      <Stack space={2}>
        <Text weight='medium'>
          {intl.formatMessage(messages.title)}
        </Text>

        <AutosuggestInput
          placeholder={intl.formatMessage(messages.placeholder)}
          value={compose.spoiler_text}
          onChange={handleChangeSpoilerText}
          disabled={!compose.spoiler}
          suggestions={compose.suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          onSuggestionSelected={onSuggestionSelected}
          searchTokens={[':']}
          id='cw-spoiler-input'
          className='rounded-md !bg-transparent dark:!bg-transparent'
          ref={ref}
          autoFocus
        />

        <div className='text-center'>
          <button type='button' className='text-danger-500' onClick={handleRemove}>
            {intl.formatMessage(messages.remove)}
          </button>
        </div>
      </Stack>
    </Stack>
  );
});

export default SpoilerInput;
