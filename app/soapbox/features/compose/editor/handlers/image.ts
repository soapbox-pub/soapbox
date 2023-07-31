import { $createImageNode } from '../nodes/image-node';

import type { LexicalNode } from 'lexical';
import type { ImportHandler } from 'lexical-remark';

const importImage: ImportHandler<any> /* TODO */ = (node: LexicalNode, parser) => {
  const lexicalNode = $createImageNode({ altText: node.alt ?? '', src: node.url });
  parser.append(lexicalNode);
};

export { importImage };
