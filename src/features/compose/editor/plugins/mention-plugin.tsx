/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /app/soapbox/features/compose/editor directory.
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import { useCallback, useEffect } from 'react';

import { $createMentionNode, MentionNode } from '../nodes/mention-node';

import type { TextNode } from 'lexical';

const MENTION_REGEX = new RegExp('(^|$|(?:^|\\s))([@])([a-z\\d_-]+(?:@[^@\\s]+)?)', 'i');

const getMentionMatch = (text: string) => {
  const matchArr = MENTION_REGEX.exec(text);

  if (!matchArr) return null;
  return matchArr;
};

const MentionPlugin = (): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([MentionNode])) {
      throw new Error('MentionPlugin: MentionNode not registered on editor');
    }
  }, [editor]);

  const createMentionNode = useCallback((textNode: TextNode): MentionNode => {
    return $createMentionNode(textNode.getTextContent());
  }, []);

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

  useLexicalTextEntity<MentionNode>(
    getEntityMatch,
    MentionNode,
    createMentionNode,
  );

  return null;
};

export default MentionPlugin;
