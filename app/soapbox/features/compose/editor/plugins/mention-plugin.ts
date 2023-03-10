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

import { $createMentionNode, MentionNode } from '../nodes/mention-node';

import type { TextNode } from 'lexical';

const REGEX = new RegExp('(^|$|(?:^|\\s))([@])([a-z\\d_-]+(?:@[^@\\s]+)?)', 'i');

export function MentionPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([MentionNode])) {
      throw new Error('MentionPlugin: MentionNode not registered on editor');
    }
  }, [editor]);

  const createMentionNode = useCallback((textNode: TextNode): MentionNode => {
    return $createMentionNode(textNode.getTextContent());
  }, []);

  const getMentionMatch = useCallback((text: string) => {
    const matchArr = REGEX.exec(text);

    if (matchArr === null) {
      return null;
    }

    const mentionLength = matchArr[3].length + 1;
    const startOffset = matchArr.index + matchArr[1].length;
    const endOffset = startOffset + mentionLength;
    return {
      end: endOffset,
      start: startOffset,
    };
  }, []);

  useLexicalTextEntity<MentionNode>(
    getMentionMatch,
    MentionNode,
    createMentionNode,
  );

  return null;
}
