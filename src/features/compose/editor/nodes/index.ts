/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /app/soapbox/features/compose/editor directory.
 */

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

import { useFeatures, useInstance } from 'soapbox/hooks';

import { EmojiNode } from './emoji-node';
import { ImageNode } from './image-node';
import { MentionNode } from './mention-node';

import type { Klass, LexicalNode } from 'lexical';

const useNodes = () => {
  const features = useFeatures();
  const instance = useInstance();

  const nodes: Array<Klass<LexicalNode>> = [
    AutoLinkNode,
    HashtagNode,
    EmojiNode,
    MentionNode,
  ];

  if (features.richText) {
    nodes.push(
      CodeHighlightNode,
      CodeNode,
      HorizontalRuleNode,
      LinkNode,
      ListItemNode,
      ListNode,
      QuoteNode,
    );
  }

  if (instance.pleroma.getIn(['metadata', 'markup', 'allow_headings'])) nodes.push(HeadingNode);
  if (instance.pleroma.getIn(['metadata', 'markup', 'allow_inline_images'])) nodes.push(ImageNode);

  return nodes;
};

export { useNodes };
