import classNames from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import { length } from 'stringz';

import {
  changeCompose,
  submitCompose,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  selectComposeSuggestion,
  insertEmojiCompose,
  uploadCompose,
} from 'soapbox/actions/compose';
import AutosuggestInput, { AutoSuggestion } from 'soapbox/components/autosuggest_input';
import AutosuggestTextarea from 'soapbox/components/autosuggest_textarea';
import Icon from 'soapbox/components/icon';
import { Button, Stack } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useCompose, useFeatures, usePrevious } from 'soapbox/hooks';
import { isMobile } from 'soapbox/is_mobile';

import EmojiPickerDropdown from '../components/emoji-picker/emoji-picker-dropdown';
import MarkdownButton from '../components/markdown_button';
import PollButton from '../components/poll_button';
import PollForm from '../components/polls/poll-form';
import PrivacyDropdown from '../components/privacy_dropdown';
import ReplyMentions from '../components/reply_mentions';
import ScheduleButton from '../components/schedule_button';
import SpoilerButton from '../components/spoiler_button';
import UploadForm from '../components/upload_form';
import Warning from '../components/warning';
import QuotedStatusContainer from '../containers/quoted_status_container';
import ReplyIndicatorContainer from '../containers/reply_indicator_container';
import ScheduleFormContainer from '../containers/schedule_form_container';
import UploadButtonContainer from '../containers/upload_button_container';
import WarningContainer from '../containers/warning_container';
import { countableText } from '../util/counter';

import SpoilerInput from './spoiler-input';
import TextCharacterCounter from './text_character_counter';
import VisualCharacterCounter from './visual_character_counter';

import type { Emoji } from 'soapbox/components/autosuggest_emoji';

const allowedAroundShortCode = '><\u0085\u0020\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\u0009\u000a\u000b\u000c\u000d';

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What\'s on your mind?' },
  pollPlaceholder: { id: 'compose_form.poll_placeholder', defaultMessage: 'Add a poll topic...' },
  spoiler_placeholder: { id: 'compose_form.spoiler_placeholder', defaultMessage: 'Write your warning here (optional)' },
  publish: { id: 'compose_form.publish', defaultMessage: 'Post' },
  publishLoud: { id: 'compose_form.publish_loud', defaultMessage: '{publish}!' },
  message: { id: 'compose_form.message', defaultMessage: 'Message' },
  schedule: { id: 'compose_form.schedule', defaultMessage: 'Schedule' },
  saveChanges: { id: 'compose_form.save_changes', defaultMessage: 'Save changes' },
});

interface IComposeForm<ID extends string> {
  id: ID extends 'default' ? never : ID,
  shouldCondense?: boolean,
  autoFocus?: boolean,
  clickableAreaRef?: React.RefObject<HTMLDivElement>,
}

const ComposeForm = <ID extends string>({ id, shouldCondense, autoFocus, clickableAreaRef }: IComposeForm<ID>) => {
  const history = useHistory();
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const compose = useCompose(id);
  const showSearch = useAppSelector((state) => state.search.submitted && !state.search.hidden);
  const isModalOpen = useAppSelector((state) => !!(state.modals.size && state.modals.last()!.modalType === 'COMPOSE'));
  const maxTootChars = useAppSelector((state) => state.instance.getIn(['configuration', 'statuses', 'max_characters'])) as number;
  const scheduledStatusCount = useAppSelector((state) => state.get('scheduled_statuses').size);
  const features = useFeatures();

  const { text, suggestions, spoiler, spoiler_text: spoilerText, privacy, focusDate, caretPosition, is_submitting: isSubmitting, is_changing_upload: isChangingUpload, is_uploading: isUploading, schedule: scheduledAt } = compose;
  const prevSpoiler = usePrevious(spoiler);

  const hasPoll = !!compose.poll;
  const isEditing = compose.id !== null;
  const anyMedia = compose.media_attachments.size > 0;

  const [composeFocused, setComposeFocused] = useState(false);

  const formRef = useRef(null);
  const spoilerTextRef = useRef<AutosuggestInput>(null);
  const autosuggestTextareaRef = useRef<AutosuggestTextarea>(null);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    dispatch(changeCompose(id, e.target.value));
  };

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
      e.preventDefault(); // Prevent bubbling to other ComposeForm instances
    }
  };

  const getClickableArea = () => {
    return clickableAreaRef ? clickableAreaRef.current : formRef.current;
  };

  const isEmpty = () => {
    return !(text || spoilerText || anyMedia);
  };

  const isClickOutside = (e: MouseEvent | React.MouseEvent) => {
    return ![
      // List of elements that shouldn't collapse the composer when clicked
      // FIXME: Make this less brittle
      getClickableArea(),
      document.querySelector('.privacy-dropdown__dropdown'),
      document.querySelector('.emoji-picker-dropdown__menu'),
      document.getElementById('modal-overlay'),
    ].some(element => element?.contains(e.target as any));
  };

  const handleClick = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (isEmpty() && isClickOutside(e)) {
      handleClickOutside();
    }
  }, []);

  const handleClickOutside = () => {
    setComposeFocused(false);
  };

  const handleComposeFocus = () => {
    setComposeFocused(true);
  };

  const handleSubmit = () => {
    if (text !== autosuggestTextareaRef.current?.textarea?.value) {
      // Something changed the text inside the textarea (e.g. browser extensions like Grammarly)
      // Update the state to match the current text
      dispatch(changeCompose(id, autosuggestTextareaRef.current!.textarea!.value));
    }

    // Submit disabled:
    const fulltext = [spoilerText, countableText(text)].join('');

    if (isSubmitting || isUploading || isChangingUpload || length(fulltext) > maxTootChars || (fulltext.length !== 0 && fulltext.trim().length === 0 && !anyMedia)) {
      return;
    }

    dispatch(submitCompose(id, history));
  };

  const onSuggestionsClearRequested = () => {
    dispatch(clearComposeSuggestions(id));
  };

  const onSuggestionsFetchRequested = (token: string | number) => {
    dispatch(fetchComposeSuggestions(id, token as string));
  };

  const onSuggestionSelected = (tokenStart: number, token: string | null, value: string | undefined) => {
    if (value) dispatch(selectComposeSuggestion(id, tokenStart, token, value, ['text']));
  };

  const onSpoilerSuggestionSelected = (tokenStart: number, token: string | null, value: AutoSuggestion) => {
    dispatch(selectComposeSuggestion(id, tokenStart, token, value, ['spoiler_text']));
  };

  const setCursor = (start: number, end: number = start) => {
    if (!autosuggestTextareaRef.current?.textarea) return;
    autosuggestTextareaRef.current.textarea.setSelectionRange(start, end);
  };

  const handleEmojiPick = (data: Emoji) => {
    const position   = autosuggestTextareaRef.current!.textarea!.selectionStart;
    const needsSpace = data.custom && position > 0 && !allowedAroundShortCode.includes(text[position - 1]);

    dispatch(insertEmojiCompose(id, position, data, needsSpace));
  };

  const onPaste = (files: FileList) => {
    dispatch(uploadCompose(id, files, intl));
  };

  const focusSpoilerInput = () => {
    spoilerTextRef.current?.input?.focus();
  };

  const focusTextarea = () => {
    autosuggestTextareaRef.current?.textarea?.focus();
  };

  useEffect(() => {
    const length = text.length;
    document.addEventListener('click', handleClick, true);

    if (length > 0) {
      setCursor(length); // Set cursor at end
    }

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (spoiler && !prevSpoiler) {
      focusSpoilerInput();
    } else if (!spoiler && prevSpoiler) {
      focusTextarea();
    }
  }, [spoiler]);

  useEffect(() => {
    if (typeof caretPosition === 'number') {
      setCursor(caretPosition);
    }
  }, [focusDate]);

  const renderButtons = useCallback(() => (
    <div className='flex items-center space-x-2'>
      {features.media && <UploadButtonContainer composeId={id} />}
      <EmojiPickerDropdown onPickEmoji={handleEmojiPick} />
      {features.polls && <PollButton composeId={id} />}
      {features.privacyScopes && <PrivacyDropdown composeId={id} />}
      {features.scheduledStatuses && <ScheduleButton composeId={id} />}
      {features.spoilers && <SpoilerButton composeId={id} />}
      {features.richText && <MarkdownButton composeId={id} />}
    </div>
  ), [features, id]);

  const condensed = shouldCondense && !composeFocused && isEmpty() && !isUploading;
  const disabled = isSubmitting;
  const countedText = [spoilerText, countableText(text)].join('');
  const disabledButton = disabled || isUploading || isChangingUpload || length(countedText) > maxTootChars || (countedText.length !== 0 && countedText.trim().length === 0 && !anyMedia);
  const shouldAutoFocus = autoFocus && !showSearch && !isMobile(window.innerWidth);

  let publishText: string | JSX.Element = '';

  if (isEditing) {
    publishText = intl.formatMessage(messages.saveChanges);
  } else if (privacy === 'direct') {
    publishText = (
      <>
        <Icon src={require('@tabler/icons/mail.svg')} />
        {intl.formatMessage(messages.message)}
      </>
    );
  } else if (privacy === 'private') {
    publishText = (
      <>
        <Icon src={require('@tabler/icons/lock.svg')} />
        {intl.formatMessage(messages.publish)}
      </>
    );
  } else {
    publishText = privacy !== 'unlisted' ? intl.formatMessage(messages.publishLoud, { publish: intl.formatMessage(messages.publish) }) : intl.formatMessage(messages.publish);
  }

  if (scheduledAt) {
    publishText = intl.formatMessage(messages.schedule);
  }

  return (
    <Stack className='w-full' space={4} ref={formRef} onClick={handleClick}>
      {scheduledStatusCount > 0 && (
        <Warning
          message={(
            <FormattedMessage
              id='compose_form.scheduled_statuses.message'
              defaultMessage='You have scheduled posts. {click_here} to see them.'
              values={{ click_here: (
                <Link to='/scheduled_statuses'>
                  <FormattedMessage
                    id='compose_form.scheduled_statuses.click_here'
                    defaultMessage='Click here'
                  />
                </Link>
              ) }}
            />)
          }
        />
      )}

      <WarningContainer composeId={id} />

      {!shouldCondense && <ReplyIndicatorContainer composeId={id} />}

      {!shouldCondense && <ReplyMentions composeId={id} />}

      <AutosuggestTextarea
        ref={(isModalOpen && shouldCondense) ? undefined : autosuggestTextareaRef}
        placeholder={intl.formatMessage(hasPoll ? messages.pollPlaceholder : messages.placeholder)}
        disabled={disabled}
        value={text}
        onChange={handleChange}
        suggestions={suggestions}
        onKeyDown={handleKeyDown}
        onFocus={handleComposeFocus}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        onSuggestionSelected={onSuggestionSelected}
        onPaste={onPaste}
        autoFocus={shouldAutoFocus}
        condensed={condensed}
        id='compose-textarea'
      >
        {
          !condensed &&
          <Stack space={4} className='compose-form__modifiers'>
            <UploadForm composeId={id} />
            <PollForm composeId={id} />
            <ScheduleFormContainer composeId={id} />

            <SpoilerInput
              composeId={id}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              onSuggestionSelected={onSpoilerSuggestionSelected}
              ref={spoilerTextRef}
            />
          </Stack>
        }
      </AutosuggestTextarea>

      <QuotedStatusContainer composeId={id} />

      <div
        className={classNames('flex flex-wrap items-center justify-between', {
          'hidden': condensed,
        })}
      >
        {renderButtons()}

        <div className='flex items-center space-x-4 ml-auto'>
          {maxTootChars && (
            <div className='flex items-center space-x-1'>
              <TextCharacterCounter max={maxTootChars} text={text} />
              <VisualCharacterCounter max={maxTootChars} text={text} />
            </div>
          )}

          <Button theme='primary' text={publishText} onClick={handleSubmit} disabled={disabledButton} />
        </div>
      </div>
    </Stack>
  );
};

export default ComposeForm;
