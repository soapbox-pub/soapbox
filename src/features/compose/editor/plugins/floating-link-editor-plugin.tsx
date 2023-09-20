/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /app/soapbox/features/compose/editor directory.
 */

import { $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_LOW,
  GridSelection,
  LexicalEditor,
  NodeSelection,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { Icon } from 'soapbox/components/ui';

import { getSelectedNode } from '../utils/get-selected-node';
import { setFloatingElemPosition } from '../utils/set-floating-elem-position';
import { sanitizeUrl } from '../utils/url';

const FloatingLinkEditor = ({
  editor,
  anchorElem,
}: {
   editor: LexicalEditor
   anchorElem: HTMLElement
 }): JSX.Element => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState<
     RangeSelection | GridSelection | NodeSelection | null
   >(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl('');
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
       nativeSelection !== null &&
       rootElement !== null &&
       rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild !== null) {
          inner = inner.firstElementChild as HTMLElement;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      setFloatingElemPosition(rect, editorElem, anchorElem);
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== 'link-input') {
      if (rootElement !== null) {
        setFloatingElemPosition(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl('');
    }

    return true;
  }, [anchorElem, editor]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateLinkEditor();
      });
    };

    window.addEventListener('resize', update);

    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);

      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [anchorElem.parentElement, editor, updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div
      ref={editorRef}
      className='absolute left-0 top-0 z-10 w-full max-w-sm rounded-lg bg-white opacity-0 shadow-md transition-opacity will-change-transform dark:bg-gray-900'
    >
      <div className='relative mx-3 my-2 box-border block rounded-2xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-800 outline-0 dark:bg-gray-800 dark:text-gray-100'>
        {isEditMode ? (
          <>
            <input
              className='-mx-3 -my-2 w-full border-0 bg-transparent px-3 py-2 text-sm text-gray-900 outline-0 dark:text-gray-100'
              ref={inputRef}
              value={linkUrl}
              onChange={(event) => {
                setLinkUrl(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  if (lastSelection !== null) {
                    if (linkUrl !== '') {
                      editor.dispatchCommand(
                        TOGGLE_LINK_COMMAND,
                        sanitizeUrl(linkUrl),
                      );
                    } else {
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                    }
                    setEditMode(false);
                  }
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  setEditMode(false);
                }
              }}
            />
            <div
              className='absolute inset-y-0 right-0 flex w-9 cursor-pointer items-center justify-center'
              role='button'
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
              }}
            >
              <Icon className='h-5 w-5' src={require('@tabler/icons/x.svg')} />
            </div>
          </>
        ) : (
          <>
            <a className='mr-8 block overflow-hidden text-ellipsis whitespace-nowrap text-primary-600 no-underline hover:underline dark:text-accent-blue' href={linkUrl} target='_blank' rel='noopener noreferrer'>
              {linkUrl}
            </a>
            <div
              className='absolute inset-y-0 right-0 flex w-9 cursor-pointer items-center justify-center'
              role='button'
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setEditMode(true);
              }}
            >
              <Icon className='h-5 w-5' src={require('@tabler/icons/pencil.svg')} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const useFloatingLinkEditorToolbar = (
  editor: LexicalEditor,
  anchorElem: HTMLElement,
): JSX.Element | null => {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);
      const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);

      // We don't want this menu to open for auto links.
      if (linkParent !== null && autoLinkParent === null) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, updateToolbar]);

  return isLink
    ? createPortal(
      <FloatingLinkEditor editor={activeEditor} anchorElem={anchorElem} />,
      anchorElem,
    )
    : null;
};

const FloatingLinkEditorPlugin = ({
  anchorElem = document.body,
}: {
   anchorElem?: HTMLElement
 }): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(editor, anchorElem);
};

export default FloatingLinkEditorPlugin;
