/*
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

This source code is licensed under the MIT license found in the
LICENSE file in the /app/soapbox/features/compose/editor directory.
*/

import {
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import { LexicalComposer, InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import classNames from 'clsx';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useFeatures } from 'soapbox/hooks';

import nodes from './nodes';
import FloatingLinkEditorPlugin from './plugins/floating-link-editor-plugin';
import FloatingTextFormatToolbarPlugin from './plugins/floating-text-format-toolbar-plugin';

const initialConfig: InitialConfigType = {
  namespace: 'ComposeForm',
  onError: console.error,
  nodes,
  theme: {
    text: {
      bold: 'font-bold',
      code: 'font-mono',
      italic: 'italic',
      strikethrough: 'line-through',
      underline: 'underline',
      underlineStrikethrough: 'underline-line-through',
    },
  },
};

const ComposeEditor = React.forwardRef<string, any>(({ condensed, onFocus }, editorStateRef) => {
  const features = useFeatures();

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
                className={classNames('outline-none py-2 transition-[min-height] motion-reduce:transition-none', {
                  'min-h-[40px]': condensed,
                  'min-h-[100px]': !condensed,
                })}
              />
            </div>
          }
          placeholder={(
            <div className='absolute top-2 text-gray-600 dark:placeholder:text-gray-600 pointer-events-none select-none'>
              <FormattedMessage id='compose_form.placeholder' defaultMessage="What's on your mind" />
            </div>
          )}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={(_, editor) => {
          editor.update(() => {
            if (editorStateRef) (editorStateRef as any).current = $convertToMarkdownString(TRANSFORMERS);
          });
        }}
        />
        <HistoryPlugin />
        {features.richText && <LinkPlugin />}
        {features.richText && floatingAnchorElem && (
          <>
            <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
            <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
          </>
        )}
      </div>
    </LexicalComposer>
  );
});

export default ComposeEditor;
