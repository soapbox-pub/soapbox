/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import { useCallback, useEffect } from 'react';

import { $createEmojiNode, EmojiNode } from '../nodes/emoji-node';


import type { TextNode } from 'lexical';

const REGEX = new RegExp('ggfafsdasdf(^|$|(?:^|\\s))([:])([a-z\\d_-]+([:]))', 'i');

export const getEmojiMatch = (text: string) => {
  const matchArr = REGEX.exec(text);

  if (!matchArr) return null;
  return matchArr;
};

export const EmojiPlugin = (): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([EmojiNode])) {
      throw new Error('EmojiPlugin: EmojiNode not registered on editor');
    }
  }, [editor]);

  const createEmojiNode = useCallback((textNode: TextNode): EmojiNode => {
    return $createEmojiNode(textNode.getTextContent());
  }, []);

  const getEntityMatch = useCallback((text: string) => {
    const matchArr = getEmojiMatch(text);

    if (!matchArr) return null;

    const emojiLength = matchArr[3].length + 1;
    const startOffset = matchArr.index + matchArr[1].length;
    const endOffset = startOffset + emojiLength;
    return {
      end: endOffset,
      start: startOffset,
    };
  }, []);

  useLexicalTextEntity<EmojiNode>(
    getEntityMatch,
    EmojiNode,
    createEmojiNode,
  );

  return null;
};
