/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { addClassNamesToElement } from '@lexical/utils';
import { $applyNodeReplacement, TextNode } from 'lexical';

import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
} from 'lexical';

class EmojiNode extends TextNode {

  static getType(): string {
    return 'emoji';
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(element, config.theme.emoji);
    return element;
  }

  static importJSON(serializedNode: SerializedTextNode): EmojiNode {
    const node = $createEmojiNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: 'emoji',
    };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }

}

const $createEmojiNode = (text = ''): EmojiNode => $applyNodeReplacement(new EmojiNode(text).setMode('token'));

const $isEmojiNode = (
  node: LexicalNode | null | undefined,
): node is EmojiNode => node instanceof EmojiNode;

export { EmojiNode, $createEmojiNode, $isEmojiNode };
