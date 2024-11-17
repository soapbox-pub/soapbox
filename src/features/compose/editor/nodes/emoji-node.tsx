import { $applyNodeReplacement, DecoratorNode } from 'lexical';

import { isNativeEmoji, type Emoji } from 'soapbox/features/emoji/index.ts';

import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

type SerializedEmojiNode = Spread<{
  data: Emoji;
  type: 'emoji';
  version: 1;
}, SerializedLexicalNode>;

class EmojiNode extends DecoratorNode<React.ReactNode> {

  __emoji: Emoji;

  static getType(): 'emoji' {
    return 'emoji';
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__emoji, node.__key);
  }

  constructor(emoji: Emoji, key?: NodeKey) {
    super(key);
    this.__emoji = emoji;
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

  static importJSON({ data }: SerializedEmojiNode): EmojiNode {
    return $createEmojiNode(data);
  }

  exportJSON(): SerializedEmojiNode {
    return {
      data: this.__emoji,
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
    const emoji = this.__emoji;
    if (isNativeEmoji(emoji)) {
      return emoji.native;
    } else {
      return emoji.colons;
    }
  }

  decorate(): React.ReactNode {
    const emoji = this.__emoji;
    if (isNativeEmoji(emoji)) {
      return emoji.native;
    } else {
      return <img src={emoji.imageUrl} alt={emoji.colons} className='inline size-4' />;
    }
  }

}

function $createEmojiNode(emoji: Emoji): EmojiNode {
  const node = new EmojiNode(emoji);
  return $applyNodeReplacement(node);
}

const $isEmojiNode = (
  node: LexicalNode | null | undefined,
): node is EmojiNode => node instanceof EmojiNode;

export { EmojiNode, $createEmojiNode, $isEmojiNode };
