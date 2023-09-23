import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, KEY_ENTER_COMMAND } from 'lexical';
import { useEffect } from 'react';

import { setEditorState } from 'soapbox/actions/compose';
import { useAppDispatch } from 'soapbox/hooks';

interface IStatePlugin {
  composeId: string
  handleSubmit?: () => void
}

const StatePlugin = ({ composeId, handleSubmit }: IStatePlugin) => {
  const dispatch = useAppDispatch();
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (handleSubmit) {
      return editor.registerCommand(KEY_ENTER_COMMAND, (event) => {
        if (event?.ctrlKey) {
          handleSubmit();
          return true;
        }
        return false;
      }, 1);
    }
  }, [handleSubmit]);

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
