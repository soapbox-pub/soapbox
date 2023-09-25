import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import React from 'react';

import { Emoji } from 'soapbox/components/ui';

import type {
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

type SerializedEmojiNode = Spread<{
  name: string
  src: string
  type: 'emoji'
  version: 1
}, SerializedLexicalNode>;

class EmojiNode extends DecoratorNode<JSX.Element> {

  __name: string;
  __src: string;

  static getType(): 'emoji' {
    return 'emoji';
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__name, node.__src, node.__key);
  }

  constructor(name: string, src: string, key?: NodeKey) {
    super(key);
    this.__name = name;
    this.__src = src;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.emoji;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__name);
    element.classList.add('h-4', 'w-4');
    return { element };
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    const { name, src } = serializedNode;
    const node = $createEmojiNode(name, src);
    return node;
  }

  exportJSON(): SerializedEmojiNode {
    return {
      name: this.__name,
      src: this.__src,
      type: 'emoji',
      version: 1,
    };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  isTextEntity(): boolean {
    return true;
  }

  getTextContent(): string {
    return this.__name;
  }

  decorate(): JSX.Element {
    return (
      <Emoji src={this.__src} alt={this.__name} className='emojione h-4 w-4' />
    );
  }

}

function $createEmojiNode (name = '', src: string): EmojiNode {
  const node = new EmojiNode(name, src);
  return $applyNodeReplacement(node);
}

const $isEmojiNode = (
  node: LexicalNode | null | undefined,
): node is EmojiNode => node instanceof EmojiNode;

export { EmojiNode, $createEmojiNode, $isEmojiNode };
