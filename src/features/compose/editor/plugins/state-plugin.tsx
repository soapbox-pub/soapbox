import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { KEY_ENTER_COMMAND } from 'lexical';
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
    if (handleSubmit) editor.registerCommand(KEY_ENTER_COMMAND, (event) => {
      if (event?.ctrlKey) {
        handleSubmit();
        return true;
      }
      return false;
    }, 1);
    editor.registerUpdateListener(({ editorState }) => {
      dispatch(setEditorState(composeId, editorState.isEmpty() ? null : JSON.stringify(editorState.toJSON())));
    });
  }, [editor]);

  return null;
};

export default StatePlugin;
