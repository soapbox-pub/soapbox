import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

interface IFocusPlugin {
  autoFocus?: boolean
}

const FocusPlugin: React.FC<IFocusPlugin> = ({ autoFocus }) => {
  const [editor] = useLexicalComposerContext();

  const focus = () => {
    editor.focus(
      () => {
        const activeElement = document.activeElement;
        const rootElement = editor.getRootElement();
        if (
          rootElement !== null &&
        (activeElement === null || !rootElement.contains(activeElement))
        ) {
          rootElement.focus({ preventScroll: true });
        }
      }, { defaultSelection: 'rootEnd' },
    );
  };

  useEffect(() => {
    if (autoFocus) focus();
  }, []);

  return null;
};

export default FocusPlugin;
