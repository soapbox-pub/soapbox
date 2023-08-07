/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /app/soapbox/features/compose/editor directory.
 */

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { QuoteNode } from '@lexical/rich-text';

import { EmojiNode } from './emoji-node';
import { MentionNode } from './mention-node';

import type { Klass, LexicalNode } from 'lexical';

const TableCellNodes: Array<Klass<LexicalNode>> = [
  AutoLinkNode,
  HashtagNode,
  EmojiNode,
  MentionNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  LinkNode,
  ListItemNode,
  ListNode,
];

export default TableCellNodes;
