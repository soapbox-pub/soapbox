/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /app/soapbox/features/compose/editor directory.
 */

import { AutoLinkPlugin, createLinkMatcherWithRegExp } from '@lexical/react/LexicalAutoLinkPlugin';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { $createRemarkExport, $createRemarkImport } from '@mkljczk/lexical-remark';
import clsx from 'clsx';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import React, { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useAppDispatch, useFeatures } from 'soapbox/hooks';

import { importImage } from './handlers/image';
import { useNodes } from './nodes';
import AutosuggestPlugin from './plugins/autosuggest-plugin';
import FloatingBlockTypeToolbarPlugin from './plugins/floating-block-type-toolbar-plugin';
import FloatingLinkEditorPlugin from './plugins/floating-link-editor-plugin';
import FloatingTextFormatToolbarPlugin from './plugins/floating-text-format-toolbar-plugin';
import FocusPlugin from './plugins/focus-plugin';
import MentionPlugin from './plugins/mention-plugin';
import StatePlugin from './plugins/state-plugin';

const LINK_MATCHERS = [
  createLinkMatcherWithRegExp(
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
    (text) => text.startsWith('http') ? text : `https://${text}`,
  ),
];

interface IComposeEditor {
  className?: string
  placeholderClassName?: string
  composeId: string
  condensed?: boolean
  eventDiscussion?: boolean
  hasPoll?: boolean
  autoFocus?: boolean
  handleSubmit?: () => void
  onFocus?: React.FocusEventHandler<HTMLDivElement>
  onPaste?: (files: FileList) => void
  placeholder?: JSX.Element | string
}

const theme = {
  hashtag: 'hover:underline text-primary-600 dark:text-accent-blue hover:text-primary-800 dark:hover:text-accent-blue',
  mention: 'hover:underline text-primary-600 dark:text-accent-blue hover:text-primary-800 dark:hover:text-accent-blue',
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

const ComposeEditor = React.forwardRef<string, IComposeEditor>(({
  className,
  placeholderClassName,
  composeId,
  condensed,
  eventDiscussion,
  hasPoll,
  autoFocus,
  handleSubmit,
  onFocus,
  onPaste,
  placeholder,
}, editorStateRef) => {
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const nodes = useNodes();

  const [suggestionsHidden, setSuggestionsHidden] = useState(true);

  const initialConfig: InitialConfigType = useMemo(() => ({
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
        if (compose.content_type === 'text/markdown') {
          $createRemarkImport({
            handlers: {
              image: importImage,
            },
          })(compose.text);
        } else {
          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(compose.text);

          paragraph.append(textNode);

          $getRoot()
            .clear()
            .append(paragraph);
        }
      };
    }),
  }), []);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

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
      <div className={clsx('relative', className)} data-markup>
        <RichTextPlugin
          contentEditable={
            <div ref={onRef} onFocus={onFocus} onPaste={handlePaste}>
              <ContentEditable
                className={clsx('outline-none transition-[min-height] motion-reduce:transition-none', {
                  'min-h-[39px]': condensed,
                  'min-h-[99px]': !condensed,
                })}
              />
            </div>
          }
          placeholder={(
            <div
              className={clsx(
                'pointer-events-none absolute top-0 -z-10 select-none text-[1rem] text-gray-600 dark:placeholder:text-gray-600',
                placeholderClassName,
              )}
            >
              {textareaPlaceholder}
            </div>
          )}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={(_, editor) => {
          if (editorStateRef) (editorStateRef as any).current = editor.getEditorState().read($createRemarkExport());
        }}
        />
        <HistoryPlugin />
        <HashtagPlugin />
        <MentionPlugin />
        <AutosuggestPlugin composeId={composeId} suggestionsHidden={suggestionsHidden} setSuggestionsHidden={setSuggestionsHidden} />
        <AutoLinkPlugin matchers={LINK_MATCHERS} />
        {features.richText && <LinkPlugin />}
        {features.richText && <ListPlugin />}
        {features.richText && floatingAnchorElem && (
          <>
            <FloatingBlockTypeToolbarPlugin anchorElem={floatingAnchorElem} />
            <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
            <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
          </>
        )}
        <StatePlugin composeId={composeId} handleSubmit={handleSubmit} />
        <FocusPlugin autoFocus={autoFocus} />
      </div>
    </LexicalComposer>
  );
});

export default ComposeEditor;
