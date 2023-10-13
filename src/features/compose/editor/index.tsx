/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the `/src/features/compose/editor` directory.
 */

import { AutoLinkPlugin, createLinkMatcherWithRegExp } from '@lexical/react/LexicalAutoLinkPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import clsx from 'clsx';
import { $createParagraphNode, $createTextNode, $getRoot, type LexicalEditor } from 'lexical';
import React, { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useAppDispatch } from 'soapbox/hooks';

import { useNodes } from './nodes';
import AutosuggestPlugin from './plugins/autosuggest-plugin';
import FocusPlugin from './plugins/focus-plugin';
import RefPlugin from './plugins/ref-plugin';
import StatePlugin from './plugins/state-plugin';
import SubmitPlugin from './plugins/submit-plugin';

const LINK_MATCHERS = [
  createLinkMatcherWithRegExp(
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
    (text) => text.startsWith('http') ? text : `https://${text}`,
  ),
];

interface IComposeEditor {
  className?: string;
  placeholderClassName?: string;
  composeId: string;
  condensed?: boolean;
  eventDiscussion?: boolean;
  hasPoll?: boolean;
  autoFocus?: boolean;
  handleSubmit?(): void;
  onPaste?(files: FileList): void;
  onChange?(text: string): void;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  placeholder?: JSX.Element | string;
}

const theme: InitialConfigType['theme'] = {
  emoji: 'select-none',
  hashtag: 'hover:underline text-primary-600 dark:text-accent-blue hover:text-primary-800 dark:hover:text-accent-blue',
  mention: 'hover:underline text-primary-600 dark:text-accent-blue hover:text-primary-800 dark:hover:text-accent-blue',
  link: 'hover:underline text-primary-600 dark:text-accent-blue hover:text-primary-800 dark:hover:text-accent-blue',
  text: {
    bold: 'font-bold',
    code: 'font-mono',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
    underlineStrikethrough: 'underline-line-through',
  },
  heading: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-bold',
    h3: 'text-lg font-semibold',
  },
};

const ComposeEditor = React.forwardRef<LexicalEditor, IComposeEditor>(({
  className,
  placeholderClassName,
  composeId,
  condensed,
  eventDiscussion,
  hasPoll,
  autoFocus,
  handleSubmit,
  onChange,
  onFocus,
  onPaste,
  placeholder,
}, ref) => {
  const dispatch = useAppDispatch();
  const nodes = useNodes();

  const [suggestionsHidden, setSuggestionsHidden] = useState(true);

  const initialConfig = useMemo<InitialConfigType>(() => ({
    namespace: 'ComposeForm',
    onError: console.error,
    nodes,
    theme,
    editorState: dispatch((_, getState) => {
      const state = getState();
      const compose = state.compose.get(composeId);

      if (!compose) return;

      if (compose.editorState) {
        return compose.editorState;
      }

      return () => {
        const paragraph = $createParagraphNode();
        const textNode = $createTextNode(compose.text);

        paragraph.append(textNode);

        $getRoot()
          .clear()
          .append(paragraph);
      };
    }),
  }), []);

  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    if (onPaste && e.clipboardData && e.clipboardData.files.length === 1) {
      onPaste(e.clipboardData.files);
      e.preventDefault();
    }
  };

  let textareaPlaceholder = placeholder || <FormattedMessage id='compose_form.placeholder' defaultMessage="What's on your mind?" />;

  if (eventDiscussion) {
    textareaPlaceholder = <FormattedMessage id='compose_form.event_placeholder' defaultMessage='Post to this event' />;
  } else if (hasPoll) {
    textareaPlaceholder = <FormattedMessage id='compose_form.poll_placeholder' defaultMessage='Add a poll topic…' />;
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={clsx('relative', className)}>
        <PlainTextPlugin
          contentEditable={
            <div onFocus={onFocus} onPaste={handlePaste}>
              <ContentEditable
                className={clsx('relative z-10 text-[1rem] outline-none transition-[min-height] motion-reduce:transition-none', {
                  'min-h-[39px]': condensed,
                  'min-h-[99px]': !condensed,
                })}
              />
            </div>
          }
          placeholder={(
            <div
              className={clsx(
                'pointer-events-none absolute top-0 select-none text-[1rem] text-gray-600 dark:placeholder:text-gray-600',
                placeholderClassName,
              )}
            >
              {textareaPlaceholder}
            </div>
          )}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={(_, editor) => {
          onChange?.(editor.getEditorState().read(() => $getRoot().getTextContent()));
        }}
        />
        <HistoryPlugin />
        <HashtagPlugin />
        <AutosuggestPlugin composeId={composeId} suggestionsHidden={suggestionsHidden} setSuggestionsHidden={setSuggestionsHidden} />
        <AutoLinkPlugin matchers={LINK_MATCHERS} />
        <StatePlugin composeId={composeId} />
        <SubmitPlugin composeId={composeId} handleSubmit={handleSubmit} />
        <FocusPlugin autoFocus={autoFocus} />
        <ClearEditorPlugin />
        <RefPlugin ref={ref} />
      </div>
    </LexicalComposer>
  );
});

export default ComposeEditor;
