import {
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import nodes from './nodes';
import FloatingLinkEditorPlugin from './plugins/floating-link-editor-plugin';
import FloatingTextFormatToolbarPlugin from './plugins/floating-text-format-toolbar-plugin';

// import type { EditorState } from 'lexical';

const initialConfig = {
  namespace: 'ComposeForm',
  onError: console.error,
  nodes,
};

const ComposeEditor = React.forwardRef<string, any>((_, editorStateRef) => {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className='relative' data-markup>
        <RichTextPlugin
          contentEditable={
            <div className='editor' ref={onRef}>
              <ContentEditable className='outline-none py-2 min-h-[100px]' />
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
        <LinkPlugin />
        {floatingAnchorElem ? (
          <>
            <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
            <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
          </>
        ) : ''}
      </div>
    </LexicalComposer>
  );
});

export default ComposeEditor;
