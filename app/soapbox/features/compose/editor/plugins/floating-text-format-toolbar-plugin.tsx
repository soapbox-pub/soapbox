/*
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

This source code is licensed under the MIT license found in the
LICENSE file in the /app/soapbox/features/compose/editor directory.
*/

import { $createCodeNode, $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $setBlocksType,
} from '@lexical/selection';
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import clsx from 'clsx';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  DEPRECATED_$isGridSelection,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { Icon } from 'soapbox/components/ui';

import { getDOMRangeRect } from '../utils/get-dom-range-rect';
import { getSelectedNode } from '../utils/get-selected-node';
import { setFloatingElemPosition } from '../utils/set-floating-elem-position';

const blockTypeToIcon = {
  bullet: require('@tabler/icons/list.svg'),
  check: require('@tabler/icons/list-check.svg'),
  code: require('@tabler/icons/code.svg'),
  h1: require('@tabler/icons/h-1.svg'),
  h2: require('@tabler/icons/h-2.svg'),
  h3: require('@tabler/icons/h-3.svg'),
  h4: require('@tabler/icons/h-4.svg'),
  h5: require('@tabler/icons/h-5.svg'),
  h6: require('@tabler/icons/h-6.svg'),
  number: require('@tabler/icons/list-numbers.svg'),
  paragraph: require('@tabler/icons/align-left.svg'),
  quote: require('@tabler/icons/blockquote.svg'),
};

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

const BlockTypeDropdown = ({ editor, anchorElem, blockType, icon }: {
  editor: LexicalEditor
  anchorElem: HTMLElement
  blockType: keyof typeof blockTypeToBlockName
  icon: string
}) => {
  const [showDropDown, setShowDropDown] = useState(false);

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (
        $isRangeSelection(selection) ||
        DEPRECATED_$isGridSelection(selection)
      ) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        let selection = $getSelection();

        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection))
              selection.insertRawText(textContent);
          }
        }
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDropDown(!showDropDown)}
        className='popup-item spaced relative'
        aria-label=''
        type='button'
      >
        <Icon src={icon} />
        <Icon src={require('@tabler/icons/chevron-down.svg')} className='-bottom-2 h-4 w-4' />
        {showDropDown && (
          <div className='floating-text-format-popup' style={{ opacity: 1, top: 36 }}>
            <button
              onClick={formatParagraph}
              className={clsx('popup-item spaced', blockType === 'paragraph' && 'active')}
              type='button'
            >
              <Icon src={blockTypeToIcon.paragraph} />
            </button>
            <button
              onClick={() => formatHeading('h1')}
              className={clsx('popup-item spaced', blockType === 'h1' && 'active')}
              type='button'
            >
              <Icon src={blockTypeToIcon.h1} />
            </button>
            <button
              onClick={() => formatHeading('h2')}
              className={clsx('popup-item spaced', blockType === 'h2' && 'active')}
              type='button'
            >
              <Icon src={blockTypeToIcon.h2} />
            </button>
            <button
              onClick={() => formatHeading('h3')}
              className={clsx('popup-item spaced', blockType === 'h3' && 'active')}
              type='button'
            >
              <Icon src={blockTypeToIcon.h3} />
            </button>
            <button
              onClick={formatBulletList}
              className={clsx('popup-item spaced', blockType === 'bullet' && 'active')}
              type='button'
            >
              <Icon src={blockTypeToIcon.bullet} />
            </button>
            <button
              onClick={formatNumberedList}
              className={clsx('popup-item spaced', blockType === 'number' && 'active')}
              type='button'
            >
              <Icon src={blockTypeToIcon.number} />
            </button>
            <button
              onClick={formatQuote}
              className={clsx('popup-item spaced', blockType === 'quote' && 'active')}
              type='button'
            >
              <Icon src={blockTypeToIcon.quote} />
            </button>
            <button
              onClick={formatCode}
              className={clsx('popup-item spaced', blockType === 'code' && 'active')}
              type='button'
            >
              <Icon src={blockTypeToIcon.code} />
            </button>
          </div>
        )}
      </button>
    </>
  );
};

const TextFormatFloatingToolbar = ({
  editor,
  anchorElem,
  blockType,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
}: {
   editor: LexicalEditor
   anchorElem: HTMLElement
   blockType: keyof typeof blockTypeToBlockName
   isBold: boolean
   isCode: boolean
   isItalic: boolean
   isLink: boolean
   isStrikethrough: boolean
   isUnderline: boolean
 }): JSX.Element => {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = window.getSelection();

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(rangeRect, popupCharStylesEditorElem, anchorElem);
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateTextFormatFloatingToolbar();
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
  }, [editor, updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateTextFormatFloatingToolbar();
    });

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateTextFormatFloatingToolbar]);

  return (
    <div ref={popupCharStylesEditorRef} className='floating-text-format-popup'>
      {editor.isEditable() && (
        <>
          <BlockTypeDropdown
            editor={editor}
            anchorElem={anchorElem}
            blockType={blockType}
            icon={blockTypeToIcon[blockType]}
          />
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            }}
            className={'popup-item spaced ' + (isBold ? 'active' : '')}
            aria-label='Format text as bold'
            type='button'
          >
            <Icon src={require('@tabler/icons/bold.svg')} />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            }}
            className={'popup-item spaced ' + (isItalic ? 'active' : '')}
            aria-label='Format text as italics'
            type='button'
          >
            <Icon src={require('@tabler/icons/italic.svg')} />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            }}
            className={'popup-item spaced ' + (isUnderline ? 'active' : '')}
            aria-label='Format text to underlined'
            type='button'
          >
            <Icon src={require('@tabler/icons/underline.svg')} />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            }}
            className={'popup-item spaced ' + (isStrikethrough ? 'active' : '')}
            aria-label='Format text with a strikethrough'
            type='button'
          >
            <Icon src={require('@tabler/icons/strikethrough.svg')} />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
            }}
            className={'popup-item spaced ' + (isCode ? 'active' : '')}
            aria-label='Insert code block'
            type='button'
          >
            <Icon src={require('@tabler/icons/code.svg')} />
          </button>
          <button
            onClick={insertLink}
            className={'popup-item spaced ' + (isLink ? 'active' : '')}
            aria-label='Insert link'
            type='button'
          >
            <Icon src={require('@tabler/icons/link.svg')} />
          </button>
        </>
      )}
    </div>
  );
};

const useFloatingTextFormatToolbar = (
  editor: LexicalEditor,
  anchorElem: HTMLElement,
): JSX.Element | null => {
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
            const parent = e.getParent();
            return parent !== null && $isRootOrShadowRoot(parent);
          });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ''
      ) {
        setIsText($isTextNode(node));
      } else {
        setIsText(false);
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener('selectionchange', updatePopup);
    return () => {
      document.removeEventListener('selectionchange', updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, updatePopup]);

  if (!isText || isLink) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      blockType={blockType}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isStrikethrough={isStrikethrough}
      isUnderline={isUnderline}
      isCode={isCode}
    />,
    anchorElem,
  );
};

const FloatingTextFormatToolbarPlugin = ({
  anchorElem = document.body,
}: {
   anchorElem?: HTMLElement
 }): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem);
};

export default FloatingTextFormatToolbarPlugin;
