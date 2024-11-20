import lockIcon from '@tabler/icons/outline/lock.svg';
import mailIcon from '@tabler/icons/outline/mail.svg';
import clsx from 'clsx';
import { CLEAR_EDITOR_COMMAND, TextNode, type LexicalEditor, $getRoot } from 'lexical';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { length } from 'stringz';

import {
  changeCompose,
  submitCompose,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  selectComposeSuggestion,
  uploadCompose,
} from 'soapbox/actions/compose.ts';
import { useCustomEmojis } from 'soapbox/api/hooks/useCustomEmojis.ts';
import AutosuggestInput, { AutoSuggestion } from 'soapbox/components/autosuggest-input.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import EmojiPickerDropdown from 'soapbox/features/emoji/containers/emoji-picker-dropdown-container.tsx';
import { ComposeEditor } from 'soapbox/features/ui/util/async-components.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useCompose } from 'soapbox/hooks/useCompose.ts';
import { useDraggedFiles } from 'soapbox/hooks/useDraggedFiles.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { usePrevious } from 'soapbox/hooks/usePrevious.ts';

import QuotedStatusContainer from '../containers/quoted-status-container.tsx';
import ReplyIndicatorContainer from '../containers/reply-indicator-container.ts';
import UploadButtonContainer from '../containers/upload-button-container.ts';
import WarningContainer from '../containers/warning-container.tsx';
import { $createEmojiNode } from '../editor/nodes/emoji-node.tsx';
import { countableText } from '../util/counter.ts';

import MarkdownButton from './markdown-button.tsx';
import PollButton from './poll-button.tsx';
import PollForm from './polls/poll-form.tsx';
import PrivacyDropdown from './privacy-dropdown.tsx';
import ReplyGroupIndicator from './reply-group-indicator.tsx';
import ReplyMentions from './reply-mentions.tsx';
import ScheduleButton from './schedule-button.tsx';
import ScheduleForm from './schedule-form.tsx';
import SpoilerButton from './spoiler-button.tsx';
import SpoilerInput from './spoiler-input.tsx';
import TextCharacterCounter from './text-character-counter.tsx';
import UploadForm from './upload-form.tsx';
import VisualCharacterCounter from './visual-character-counter.tsx';

import type { Emoji } from 'soapbox/features/emoji/index.ts';

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
  const { instance } = useInstance();

  const compose = useCompose(id);
  const showSearch = useAppSelector((state) => state.search.submitted && !state.search.hidden);
  const maxTootChars = instance.configuration.statuses.max_characters;
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

  const firstRender = useRef(true);
  const formRef = useRef<HTMLDivElement>(null);
  const spoilerTextRef = useRef<AutosuggestInput>(null);
  const editorRef = useRef<LexicalEditor>(null);
  const { isDraggedOver } = useDraggedFiles(formRef);
  const { customEmojis } = useCustomEmojis();

  const text = editorRef.current?.getEditorState().read(() => $getRoot().getTextContent()) ?? '';
  const fulltext = [spoilerText, countableText(text)].join('');

  const isEmpty = !(fulltext.trim() || anyMedia);
  const condensed = shouldCondense && !isDraggedOver && !composeFocused && isEmpty && !isUploading;
  const shouldAutoFocus = autoFocus && !showSearch;
  const canSubmit = !!editorRef.current && !isSubmitting && !isUploading && !isChangingUpload && !isEmpty && length(fulltext) <= maxTootChars;

  const getClickableArea = () => {
    return clickableAreaRef ? clickableAreaRef.current : formRef.current;
  };

  const isClickOutside = (e: MouseEvent | React.MouseEvent) => {
    return ![
      // List of elements that shouldn't collapse the composer when clicked
      // FIXME: Make this less brittle
      getClickableArea(),
      document.getElementById('privacy-dropdown'),
      document.querySelector('em-emoji-picker'),
      document.getElementById('modal-overlay'),
    ].some(element => element?.contains(e.target as any));
  };

  const handleClick = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (isEmpty && isClickOutside(e)) {
      handleClickOutside();
    }
  }, [isEmpty]);

  const handleClickOutside = () => {
    setComposeFocused(false);
  };

  const handleComposeFocus = () => {
    setComposeFocused(true);
  };

  const handleSubmit = (e?: React.FormEvent<Element>) => {
    if (!canSubmit) return;
    e?.preventDefault();

    dispatch(changeCompose(id, text));
    dispatch(submitCompose(id, { history }));

    editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
  };

  const onSuggestionsClearRequested = () => {
    dispatch(clearComposeSuggestions(id));
  };

  const onSuggestionsFetchRequested = (token: string) => {
    dispatch(fetchComposeSuggestions(id, token, customEmojis));
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

  const composeModifiers = !condensed && (
    <Stack space={4} className='text-sm text-gray-900'>
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
    publishIcon = mailIcon;
    publishText = intl.formatMessage(messages.message);
  } else if (privacy === 'private') {
    publishIcon = lockIcon;
    publishText = intl.formatMessage(messages.publish);
  } else {
    publishText = privacy !== 'unlisted' ? intl.formatMessage(messages.publishLoud, { publish: intl.formatMessage(messages.publish) }) : intl.formatMessage(messages.publish);
  }

  if (scheduledAt) {
    publishText = intl.formatMessage(messages.schedule);
  }

  return (
    <Stack className='w-full' space={4} ref={formRef} onClick={handleClick} element='form' onSubmit={handleSubmit}>
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

          <Button type='submit' theme='primary' icon={publishIcon} text={publishText} disabled={!canSubmit} />
        </HStack>
      </div>
    </Stack>
  );
};

export default ComposeForm;
