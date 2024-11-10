/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /src/features/compose/editor directory.
 */

import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode } from '@lexical/link';

import { EmojiNode } from './emoji-node.tsx';
import { MentionNode } from './mention-node.tsx';

import type { Klass, LexicalNode } from 'lexical';

const useNodes = () => {
  const nodes: Array<Klass<LexicalNode>> = [
    AutoLinkNode,
    HashtagNode,
    EmojiNode,
    MentionNode,
  ];

  return nodes;
};

export { useNodes };
