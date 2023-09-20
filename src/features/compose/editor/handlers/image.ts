import { $createImageNode } from '../nodes/image-node';

import type { ImportHandler } from '@mkljczk/lexical-remark';
import type { LexicalNode } from 'lexical';

const importImage: ImportHandler<any> /* TODO */ = (node: LexicalNode, parser) => {
  const lexicalNode = $createImageNode({ altText: node.alt ?? '', src: node.url });
  parser.append(lexicalNode);
};

export { importImage };
