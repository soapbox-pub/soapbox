import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { useEffect } from 'react';

import { setEditorState } from 'soapbox/actions/compose';
import { useAppDispatch } from 'soapbox/hooks';

interface IStatePlugin {
  composeId: string;
}

const StatePlugin: React.FC<IStatePlugin> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      const text = editorState.read(() => $getRoot().getTextContent());
      const isEmpty = text === '';
      const data = isEmpty ? null : JSON.stringify(editorState.toJSON());
      dispatch(setEditorState(composeId, data, text));
    });
  }, [editor]);

  return null;
};

export default StatePlugin;
