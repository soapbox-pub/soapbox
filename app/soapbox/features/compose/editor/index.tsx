/*
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

This source code is licensed under the MIT license found in the
LICENSE file in the /app/soapbox/features/compose/editor directory.
*/
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import clsx from 'clsx';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { setEditorState } from 'soapbox/actions/compose';
import { useAppDispatch, useFeatures } from 'soapbox/hooks';

import nodes from './nodes';
import DraggableBlockPlugin from './plugins/draggable-block-plugin';
import FloatingLinkEditorPlugin from './plugins/floating-link-editor-plugin';
import FloatingTextFormatToolbarPlugin from './plugins/floating-text-format-toolbar-plugin';
import { MentionPlugin } from './plugins/mention-plugin';

const StatePlugin = ({ composeId }: { composeId: string }) => {
  const dispatch = useAppDispatch();
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      dispatch(setEditorState(composeId, editorState.isEmpty() ? null : JSON.stringify(editorState.toJSON())));
    });
  }, [editor]);

  return null;
};

const ComposeEditor = React.forwardRef<string, any>(({ composeId, condensed, onFocus, autoFocus }, editorStateRef) => {
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const [suggestionsHidden, setSuggestionsHidden] = useState(true);

  const initialConfig: InitialConfigType = useMemo(function() {
    return {
      namespace: 'ComposeForm',
      onError: console.error,
      nodes,
      theme: {
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
      },
      editorState: dispatch((_, getState) => {
        const state = getState();
        const compose = state.compose.get(composeId);

        if (!compose) return;

        if (compose.editorState) {
          return compose.editorState;
        }

        return function() {
          if (compose.content_type === 'text/markdown') {
            $convertFromMarkdownString(compose.text, TRANSFORMERS);
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
    };
  }, []);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className='lexical relative' data-markup>
        <RichTextPlugin
          contentEditable={
            <div className='editor' ref={onRef} onFocus={onFocus}>
              <ContentEditable
                className={clsx('mr-4 py-2 outline-none transition-[min-height] motion-reduce:transition-none', {
                  'min-fh-[40px]': condensed,
                  'min-h-[100px]': !condensed,
                })}
                autoFocus={autoFocus}
              />
            </div>
          }
          placeholder={(
            <div className='pointer-events-none absolute top-2 select-none text-gray-600 dark:placeholder:text-gray-600'>
              <FormattedMessage id='compose_form.placeholder' defaultMessage="What's on your mind" />
            </div>
          )}
          ErrorBoundary={LexicalErrorBoundary}
        />
        {autoFocus && <AutoFocusPlugin />}
        <OnChangePlugin onChange={(_, editor) => {
          editor.update(() => {
            if (editorStateRef) (editorStateRef as any).current = $convertToMarkdownString(TRANSFORMERS);
          });
        }}
        />
        <HistoryPlugin />
        <HashtagPlugin />
        <MentionPlugin composeId={composeId} suggestionsHidden={suggestionsHidden} setSuggestionsHidden={setSuggestionsHidden} />
        {features.richText && <LinkPlugin />}
        {features.richText && floatingAnchorElem && (
          <>
            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
            <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
            <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
          </>
        )}
        <StatePlugin composeId={composeId} />
      </div>
    </LexicalComposer>
  );
});

export default ComposeEditor;
