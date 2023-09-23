import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalEditor } from 'lexical';
import React, { useEffect } from 'react';

/** Set the ref to the current Lexical editor instance. */
const RefPlugin = React.forwardRef<LexicalEditor>((_props, ref) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (ref && typeof ref !== 'function') {
      ref.current = editor;
    }
  }, [editor]);

  return null;
});

export default RefPlugin;
