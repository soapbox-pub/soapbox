/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { fetchComposeSuggestions } from 'soapbox/actions/compose';
import { useAppDispatch, useCompose } from 'soapbox/hooks';

import AutosuggestAccount from '../../components/autosuggest-account';
import { $createMentionNode, MentionNode } from '../nodes/mention-node';

import { TypeaheadMenuPlugin } from './typeahead-menu-plugin';

import type { RangeSelection, TextNode } from 'lexical';

const REGEX = new RegExp('(^|$|(?:^|\\s))([@])([a-z\\d_-]+(?:@[^@\\s]+)?)', 'i');

export const MentionPlugin: React.FC<{
  composeId: string
  suggestionsHidden: boolean
  setSuggestionsHidden: (value: boolean) => void
}> = ({
  composeId, suggestionsHidden, setSuggestionsHidden,
}): JSX.Element | null => {
  const { suggestions } = useCompose(composeId);
  const dispatch = useAppDispatch();

  const [editor] = useLexicalComposerContext();

  const [selectedSuggestion] = useState(0);

  const onSelectSuggestion: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();

    const suggestion = suggestions.get(e.currentTarget.getAttribute('data-index') as any);

    editor.update(() => {

      dispatch((_, getState) => {
        const state = editor.getEditorState();
        const node = (state._selection as RangeSelection)?.anchor?.getNode();

        const content = getState().accounts.get(suggestion)!.acct;

        node.setTextContent(`@${content} `);
        node.select();
      });
    });
  };

  useEffect(() => {
    if (!editor.hasNodes([MentionNode])) {
      throw new Error('MentionPlugin: MentionNode not registered on editor');
    }
  }, [editor]);

  const createMentionNode = useCallback((textNode: TextNode): MentionNode => {
    return $createMentionNode(textNode.getTextContent());
  }, []);

  const getMentionMatch = (text: string) => {
    const matchArr = REGEX.exec(text);

    if (!matchArr) return null;
    return matchArr;
  };

  const getEntityMatch = useCallback((text: string) => {
    const matchArr = getMentionMatch(text);

    if (!matchArr) return null;

    const mentionLength = matchArr[3].length + 1;
    const startOffset = matchArr.index + matchArr[1].length;
    const endOffset = startOffset + mentionLength;
    return {
      end: endOffset,
      start: startOffset,
    };
  }, []);

  const checkForMentionMatch = useCallback((text: string) => {
    const matchArr = getMentionMatch(text);

    if (!matchArr) return null;

    dispatch(fetchComposeSuggestions(composeId, matchArr[0]));

    return {
      leadOffset: matchArr.index,
      matchingString: matchArr[0],
    };
  }, []);

  useLexicalTextEntity<MentionNode>(
    getEntityMatch,
    MentionNode,
    createMentionNode,
  );

  const renderSuggestion = (suggestion: string, i: number) => {
    const inner = <AutosuggestAccount id={suggestion} />;
    const key = suggestion;

    return (
      <div
        role='button'
        tabIndex={0}
        key={key}
        data-index={i}
        className={clsx({
          'px-4 py-2.5 text-sm text-gray-700 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-primary-800 group': true,
          'bg-gray-100 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800': i === selectedSuggestion,
        })}
        onMouseDown={onSelectSuggestion}
      >
        {inner}
      </div>
    );
  };

  useEffect(() => {
    if (suggestions && suggestions.size > 0) setSuggestionsHidden(false);
  }, [suggestions]);

  return (
    <TypeaheadMenuPlugin
      triggerFn={checkForMentionMatch}
      menuRenderFn={(anchorElementRef) =>
        anchorElementRef.current
          ? ReactDOM.createPortal(
            <div
              className={clsx({
                'mt-6 fixed z-1000 shadow bg-white dark:bg-gray-900 rounded-lg py-1 space-y-0 dark:ring-2 dark:ring-primary-700 focus:outline-none': true,
                hidden: suggestionsHidden || suggestions.isEmpty(),
                block: !suggestionsHidden && !suggestions.isEmpty(),
              })}
            >
              {suggestions.map(renderSuggestion)}
            </div>,
            anchorElementRef.current,
          )
          : null
      }
    />
  );
};
