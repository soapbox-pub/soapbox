import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_NORMAL, createCommand, type LexicalCommand } from 'lexical';
import { useEffect } from 'react';

interface IFocusPlugin {
  autoFocus?: boolean
}

export const FOCUS_EDITOR_COMMAND: LexicalCommand<void> = createCommand();

const FocusPlugin: React.FC<IFocusPlugin> = ({ autoFocus }) => {
  const [editor] = useLexicalComposerContext();

  const focus = () => {
    editor.dispatchCommand(FOCUS_EDITOR_COMMAND, undefined);
  };

  useEffect(() => editor.registerCommand(FOCUS_EDITOR_COMMAND, () => {
    editor.focus(
      () => {
        const activeElement = document.activeElement;
        const rootElement = editor.getRootElement();
        if (rootElement !== null && (activeElement === null || !rootElement.contains(activeElement))) {
          rootElement.focus({ preventScroll: true });
        }
      }, { defaultSelection: 'rootEnd' },
    );
    return true;
  }, COMMAND_PRIORITY_NORMAL));

  useEffect(() => {
    if (autoFocus) focus();
  }, []);

  return null;
};

export default FocusPlugin;
