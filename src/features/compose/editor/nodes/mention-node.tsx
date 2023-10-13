/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /src/features/compose/editor directory.
 */

import { addClassNamesToElement } from '@lexical/utils';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import React from 'react';

import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

type SerializedMentionNode = Spread<{
  acct: string;
  type: 'mention';
  version: 1;
}, SerializedLexicalNode>;

class MentionNode extends DecoratorNode<JSX.Element> {

  __acct: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__acct, node.__key);
  }

  constructor(acct: string, key?: NodeKey) {
    super(key);
    this.__acct = acct;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    addClassNamesToElement(span, config.theme.mention);
    return span;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.acct);
    return node;
  }

  exportJSON(): SerializedMentionNode {
    return {
      type: 'mention',
      acct: this.__acct,
      version: 1,
    };
  }

  getTextContent(): string {
    return `@${this.__acct}`;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }

  decorate(): JSX.Element {
    const acct = this.__acct;
    const username = acct.split('@')[0];

    return (
      <button
        className='text-accent-blue'
        type='button'
        title={`@${acct}`}
        dir='ltr'
      >
        @{username}
      </button>
    );
  }

}

function $createMentionNode(acct: string): MentionNode {
  const node = new MentionNode(acct);
  return $applyNodeReplacement(node);
}

const $isMentionNode = (
  node: LexicalNode | null | undefined,
): node is MentionNode => node instanceof MentionNode;

export { MentionNode, $createMentionNode, $isMentionNode };
