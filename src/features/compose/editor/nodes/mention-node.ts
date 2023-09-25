/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /src/features/compose/editor directory.
 */

import { addClassNamesToElement } from '@lexical/utils';
import { $applyNodeReplacement, TextNode } from 'lexical';

import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
} from 'lexical';

class MentionNode extends TextNode {

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(element, config.theme.mention);
    return element;
  }

  static importJSON(serializedNode: SerializedTextNode): MentionNode {
    const node = $createMentionNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: 'mention',
    };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }

}

function $createMentionNode(text: string): MentionNode {
  const node = new MentionNode(text);
  node.setMode('token').toggleDirectionless();
  return $applyNodeReplacement(node);
}

const $isMentionNode = (
  node: LexicalNode | null | undefined,
): node is MentionNode => node instanceof MentionNode;

export { MentionNode, $createMentionNode, $isMentionNode };
