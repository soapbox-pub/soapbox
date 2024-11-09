/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /src/features/compose/editor directory.
 */

import { $applyNodeReplacement, DecoratorNode } from 'lexical';

import Mention from 'soapbox/components/mention';

import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import type { Mention as MentionEntity } from 'soapbox/schemas';

type SerializedMentionNode = Spread<{
  mention: MentionEntity;
  type: 'mention';
  version: 1;
}, SerializedLexicalNode>;

class MentionNode extends DecoratorNode<JSX.Element> {

  __mention: MentionEntity;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__key);
  }

  constructor(mention: MentionEntity, key?: NodeKey) {
    super(key);
    this.__mention = mention;
  }

  createDOM(config: EditorConfig): HTMLElement {
    return document.createElement('span');
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.mention);
    return node;
  }

  exportJSON(): SerializedMentionNode {
    return {
      type: 'mention',
      mention: this.__mention,
      version: 1,
    };
  }

  getTextContent(): string {
    return `@${this.__mention.acct}`;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }

  decorate(): JSX.Element {
    return (
      <Mention mention={this.__mention} disabled />
    );
  }

}

function $createMentionNode(mention: MentionEntity): MentionNode {
  const node = new MentionNode(mention);
  return $applyNodeReplacement(node);
}

const $isMentionNode = (
  node: LexicalNode | null | undefined,
): node is MentionNode => node instanceof MentionNode;

export { MentionNode, $createMentionNode, $isMentionNode };
