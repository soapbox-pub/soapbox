/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /src/features/compose/editor directory.
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import { useCallback, useEffect } from 'react';

import { $createMentionNode, MentionNode } from '../nodes/mention-node';

import type { TextNode } from 'lexical';

const MENTION_REGEX = /(?:^|\s)@[^\s]+/i;

const MentionPlugin = (): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([MentionNode])) {
      throw new Error('MentionPlugin: MentionNode not registered on editor');
    }
  }, [editor]);

  const createNode = useCallback((textNode: TextNode): MentionNode => {
    return $createMentionNode(textNode.getTextContent());
  }, []);

  const getMatch = useCallback((text: string) => {
    const match = MENTION_REGEX.exec(text);
    if (!match) return null;

    const length = match[0].length;
    const start = match.index;
    const end = start + length;

    return { start, end };
  }, []);

  useLexicalTextEntity<MentionNode>(
    getMatch,
    MentionNode,
    createNode,
  );

  return null;
};

export default MentionPlugin;
