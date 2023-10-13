import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { KEY_ENTER_COMMAND } from 'lexical';
import { useEffect } from 'react';

interface ISubmitPlugin {
  composeId: string;
  handleSubmit?: () => void;
}

const SubmitPlugin: React.FC<ISubmitPlugin> = ({ composeId, handleSubmit }) => {
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

  return null;
};

export default SubmitPlugin;
