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
    return new EmojiNode(node.__name, node.__src);
  }

  constructor(name: string, src: string, key?: NodeKey) {
    console.log(name, src);
    super(key);
    this.__name = name;
    this.__src = src;
  }

  createDOM(config: EditorConfig): HTMLElement {
    console.log('creating');
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
    console.log('exporting');
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__name);
    element.classList.add('h-4', 'w-4');
    return { element };
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    console.log('importing json');
    const { name, src } =
      serializedNode;
    const node = $createEmojiNode(name, src);
    return node;
  }

  exportJSON(): SerializedEmojiNode {
    console.log('exporting json', {
      name: this.__name,
      src: this.__src,
      type: 'emoji',
      version: 1,
    });
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

  isTextEntity(): true {
    return true;
  }

  decorate(): JSX.Element {
    console.log('decoratin', this);
    return (
      <Emoji src={this.__src} alt={this.__name} className='emojione h-4 w-4' />
    );
  }

}

const $createEmojiNode = (name = '', src: string): EmojiNode => $applyNodeReplacement(new EmojiNode(name, src));

const $isEmojiNode = (
  node: LexicalNode | null | undefined,
): node is EmojiNode => node instanceof EmojiNode;

export { EmojiNode, $createEmojiNode, $isEmojiNode };
