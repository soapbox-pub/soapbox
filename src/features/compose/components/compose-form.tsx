import clsx from 'clsx';
import { CLEAR_EDITOR_COMMAND, TextNode, type LexicalEditor } from 'lexical';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import { length } from 'stringz';

import {
  changeCompose,
  submitCompose,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  selectComposeSuggestion,
  uploadCompose,
} from 'soapbox/actions/compose';
import AutosuggestInput, { AutoSuggestion } from 'soapbox/components/autosuggest-input';
import { Button, HStack, Stack } from 'soapbox/components/ui';
import EmojiPickerDropdown from 'soapbox/features/emoji/containers/emoji-picker-dropdown-container';
import { ComposeEditor } from 'soapbox/features/ui/util/async-components';
import { useAppDispatch, useAppSelector, useCompose, useDraggedFiles, useFeatures, useInstance, usePrevious } from 'soapbox/hooks';
import { isMobile } from 'soapbox/is-mobile';

import QuotedStatusContainer from '../containers/quoted-status-container';
import ReplyIndicatorContainer from '../containers/reply-indicator-container';
import UploadButtonContainer from '../containers/upload-button-container';
import WarningContainer from '../containers/warning-container';
import { $createEmojiNode } from '../editor/nodes/emoji-node';
import { countableText } from '../util/counter';

import MarkdownButton from './markdown-button';
import PollButton from './poll-button';
import PollForm from './polls/poll-form';
import PrivacyDropdown from './privacy-dropdown';
import ReplyGroupIndicator from './reply-group-indicator';
import ReplyMentions from './reply-mentions';
import ScheduleButton from './schedule-button';
import ScheduleForm from './schedule-form';
import SpoilerButton from './spoiler-button';
import SpoilerInput from './spoiler-input';
import TextCharacterCounter from './text-character-counter';
import UploadForm from './upload-form';
import VisualCharacterCounter from './visual-character-counter';
import Warning from './warning';

import type { Emoji } from 'soapbox/features/emoji';

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What\'s on your mind?' },
  pollPlaceholder: { id: 'compose_form.poll_placeholder', defaultMessage: 'Add a poll topic…' },
  eventPlaceholder: { id: 'compose_form.event_placeholder', defaultMessage: 'Post to this event' },
  publish: { id: 'compose_form.publish', defaultMessage: 'Post' },
  publishLoud: { id: 'compose_form.publish_loud', defaultMessage: '{publish}!' },
  message: { id: 'compose_form.message', defaultMessage: 'Message' },
  schedule: { id: 'compose_form.schedule', defaultMessage: 'Schedule' },
  saveChanges: { id: 'compose_form.save_changes', defaultMessage: 'Save changes' },
});

interface IComposeForm<ID extends string> {
  id: ID extends 'default' ? never : ID;
  shouldCondense?: boolean;
  autoFocus?: boolean;
  clickableAreaRef?: React.RefObject<HTMLDivElement>;
  event?: string;
  group?: string;
  extra?: React.ReactNode;
}

const ComposeForm = <ID extends string>({ id, shouldCondense, autoFocus, clickableAreaRef, event, group, extra }: IComposeForm<ID>) => {
  const history = useHistory();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { configuration } = useInstance();

  const compose = useCompose(id);
  const showSearch = useAppSelector((state) => state.search.submitted && !state.search.hidden);
  const maxTootChars = configuration.statuses.max_characters;
  const scheduledStatusCount = useAppSelector((state) => state.scheduled_statuses.size);
  const features = useFeatures();

  const {
    spoiler,
    spoiler_text: spoilerText,
    privacy,
    is_submitting: isSubmitting,
    is_changing_upload:
    isChangingUpload,
    is_uploading: isUploading,
    schedule: scheduledAt,
    group_id: groupId,
  } = compose;

  const prevSpoiler = usePrevious(spoiler);

  const hasPoll = !!compose.poll;
  const isEditing = compose.id !== null;
  const anyMedia = compose.media_attachments.size > 0;

  const [composeFocused, setComposeFocused] = useState(false);
  const [text, setText] = useState(compose.text);

  const firstRender = useRef(true);
  const formRef = useRef<HTMLDivElement>(null);
  const spoilerTextRef = useRef<AutosuggestInput>(null);
  const editorRef = useRef<LexicalEditor>(null);

  const { isDraggedOver } = useDraggedFiles(formRef);

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
      document.querySelector('em-emoji-picker'),
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

  const handleSubmit = (e?: React.FormEvent<Element>) => {
    dispatch(changeCompose(id, text));

    // Submit disabled:
    const fulltext = [spoilerText, countableText(text)].join('');

    if (e) {
      e.preventDefault();
    }

    if (isSubmitting || isUploading || isChangingUpload || length(fulltext) > maxTootChars || (fulltext.length !== 0 && fulltext.trim().length === 0 && !anyMedia)) {
      return;
    }

    dispatch(submitCompose(id, history));
    editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
  };

  const onSuggestionsClearRequested = () => {
    dispatch(clearComposeSuggestions(id));
  };

  const onSuggestionsFetchRequested = (token: string | number) => {
    dispatch(fetchComposeSuggestions(id, token as string));
  };

  const onSpoilerSuggestionSelected = (tokenStart: number, token: string | null, value: AutoSuggestion) => {
    dispatch(selectComposeSuggestion(id, tokenStart, token, value, ['spoiler_text']));
  };

  const handleEmojiPick = (data: Emoji) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.update(() => {
      editor.getEditorState()._selection?.insertNodes([$createEmojiNode(data), new TextNode(' ')]);
    });
  };

  const onPaste = (files: FileList) => {
    dispatch(uploadCompose(id, files, intl));
  };

  const focusSpoilerInput = () => {
    spoilerTextRef.current?.input?.focus();
  };

  useEffect(() => {
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  useEffect(() => {
    if (spoiler && firstRender.current) {
      firstRender.current = false;
    } else if (!spoiler && prevSpoiler) {
      //
    } else if (spoiler && !prevSpoiler) {
      focusSpoilerInput();
    }
  }, [spoiler]);

  const renderButtons = useCallback(() => (
    <HStack alignItems='center' space={2}>
      {features.media && <UploadButtonContainer composeId={id} />}
      <EmojiPickerDropdown onPickEmoji={handleEmojiPick} condensed={shouldCondense} />
      {features.polls && <PollButton composeId={id} />}
      {features.privacyScopes && !group && !groupId && <PrivacyDropdown composeId={id} />}
      {features.scheduledStatuses && <ScheduleButton composeId={id} />}
      {features.spoilers && <SpoilerButton composeId={id} />}
      {features.richText && <MarkdownButton composeId={id} />}
    </HStack>
  ), [features, id]);

  const condensed = shouldCondense && !isDraggedOver && !composeFocused && isEmpty() && !isUploading;
  const disabled = isSubmitting;
  const countedText = [spoilerText, countableText(text)].join('');
  const disabledButton = disabled || isUploading || isChangingUpload || length(countedText) > maxTootChars || (countedText.length !== 0 && countedText.trim().length === 0 && !anyMedia);
  const shouldAutoFocus = autoFocus && !showSearch && !isMobile(window.innerWidth);

  const composeModifiers = !condensed && (
    <Stack space={4} className='compose-form__modifiers'>
      <UploadForm composeId={id} onSubmit={handleSubmit} />
      <PollForm composeId={id} />

      <SpoilerInput
        composeId={id}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        onSuggestionSelected={onSpoilerSuggestionSelected}
        ref={spoilerTextRef}
      />

      <ScheduleForm composeId={id} />
    </Stack>
  );

  let publishText: string | JSX.Element = '';
  let publishIcon: string | undefined = undefined;

  if (isEditing) {
    publishText = intl.formatMessage(messages.saveChanges);
  } else if (privacy === 'direct') {
    publishIcon = require('@tabler/icons/mail.svg');
    publishText = intl.formatMessage(messages.message);
  } else if (privacy === 'private') {
    publishIcon = require('@tabler/icons/lock.svg');
    publishText = intl.formatMessage(messages.publish);
  } else {
    publishText = privacy !== 'unlisted' ? intl.formatMessage(messages.publishLoud, { publish: intl.formatMessage(messages.publish) }) : intl.formatMessage(messages.publish);
  }

  if (scheduledAt) {
    publishText = intl.formatMessage(messages.schedule);
  }

  return (
    <Stack className='w-full' space={4} ref={formRef} onClick={handleClick} element='form' onSubmit={handleSubmit}>
      {scheduledStatusCount > 0 && !event && !group && (
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

      {!shouldCondense && !event && !group && groupId && <ReplyGroupIndicator composeId={id} />}

      {!shouldCondense && !event && !group && <ReplyIndicatorContainer composeId={id} />}

      {!shouldCondense && !event && !group && <ReplyMentions composeId={id} />}

      <div>
        <Suspense>
          <ComposeEditor
            ref={editorRef}
            className='mt-2'
            composeId={id}
            condensed={condensed}
            eventDiscussion={!!event}
            autoFocus={shouldAutoFocus}
            hasPoll={hasPoll}
            handleSubmit={handleSubmit}
            onChange={setText}
            onFocus={handleComposeFocus}
            onPaste={onPaste}
          />
        </Suspense>
        {composeModifiers}
      </div>

      <QuotedStatusContainer composeId={id} />

      {extra && <div className={clsx({ 'hidden': condensed })}>{extra}</div>}

      <div
        className={clsx('flex flex-wrap items-center justify-between', {
          'hidden': condensed,
        })}
      >
        {renderButtons()}

        <HStack space={4} alignItems='center' className='ml-auto rtl:ml-0 rtl:mr-auto'>
          {maxTootChars && (
            <HStack space={1} alignItems='center'>
              <TextCharacterCounter max={maxTootChars} text={text} />
              <VisualCharacterCounter max={maxTootChars} text={text} />
            </HStack>
          )}

          <Button type='submit' theme='primary' icon={publishIcon} text={publishText} disabled={disabledButton} />
        </HStack>
      </div>
    </Stack>
  );
};

export default ComposeForm;
