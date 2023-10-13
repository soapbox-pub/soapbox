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
      const isEmpty = editorState.read(() => $getRoot().getTextContent()) === '';
      const data = isEmpty ? null : JSON.stringify(editorState.toJSON());
      dispatch(setEditorState(composeId, data));
    });
  }, [editor]);

  return null;
};

export default StatePlugin;
