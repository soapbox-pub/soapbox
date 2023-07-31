/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /app/soapbox/features/compose/editor directory.
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
import { defineMessages, useIntl } from 'react-intl';

import { Icon } from 'soapbox/components/ui';
import { useInstance } from 'soapbox/hooks';

import { getDOMRangeRect } from '../utils/get-dom-range-rect';
import { getSelectedNode } from '../utils/get-selected-node';
import { setFloatingElemPosition } from '../utils/set-floating-elem-position';

const messages = defineMessages({
  formatBold: { id: 'compose_form.lexical.format_bold', defaultMessage: 'Format bold' },
  formatItalic: { id: 'compose_form.lexical.format_italic', defaultMessage: 'Format italic' },
  formatUnderline: { id: 'compose_form.lexical.format_underline', defaultMessage: 'Format underline' },
  formatStrikethrough: { id: 'compose_form.lexical.format_strikethrough', defaultMessage: 'Format strikethrough' },
  insertCodeBlock: { id: 'compose_form.lexical.insert_code_block', defaultMessage: 'Insert code block' },
  insertLink: { id: 'compose_form.lexical.insert_link', defaultMessage: 'Insert link' },
});

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

interface IToolbarButton extends React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean
  icon: string
}

export const ToolbarButton: React.FC<IToolbarButton> = ({ active, icon, ...props }) => (
  <button
    className={clsx(
      'flex cursor-pointer rounded-lg border-0 bg-none p-1 align-middle hover:bg-gray-100 disabled:cursor-not-allowed disabled:hover:bg-none hover:dark:bg-primary-700',
      { 'bg-gray-100/30 dark:bg-gray-800/30': active },
    )}
    type='button'
    {...props}
  >
    <Icon className='h-5 w-5' src={icon} />
  </button>
);

const BlockTypeDropdown = ({ editor, anchorElem, blockType, icon }: {
  editor: LexicalEditor
  anchorElem: HTMLElement
  blockType: keyof typeof blockTypeToBlockName
  icon: string
}) => {
  const instance = useInstance();

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
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
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
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        let selection = $getSelection();

        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
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
        className='relative flex cursor-pointer rounded-lg border-0 bg-none p-1 align-middle hover:bg-gray-100 disabled:cursor-not-allowed disabled:hover:bg-none hover:dark:bg-primary-700'
        aria-label=''
        type='button'
      >
        <Icon src={icon} />
        <Icon src={require('@tabler/icons/chevron-down.svg')} className='-bottom-2 h-4 w-4' />
        {showDropDown && (
          <div
            className='absolute left-0 top-9 z-10 flex h-[38px] gap-0.5 rounded-lg bg-white p-1 shadow-lg transition-[opacity] dark:bg-gray-900'
          >
            <ToolbarButton
              onClick={formatParagraph}
              active={blockType === 'paragraph'}
              icon={blockTypeToIcon.paragraph}
            />
            {instance.pleroma.getIn(['metadata', 'markup', 'allow_headings']) === true && (
              <>
                <ToolbarButton
                  onClick={() => formatHeading('h1')}
                  active={blockType === 'h1'}
                  icon={blockTypeToIcon.h1}
                />
                <ToolbarButton
                  onClick={() => formatHeading('h2')}
                  active={blockType === 'h2'}
                  icon={blockTypeToIcon.h2}
                />
                <ToolbarButton
                  onClick={() => formatHeading('h3')}
                  active={blockType === 'h3'}
                  icon={blockTypeToIcon.h3}
                />
              </>
            )}
            <ToolbarButton
              onClick={formatBulletList}
              active={blockType === 'bullet'}
              icon={blockTypeToIcon.bullet}
            />
            <ToolbarButton
              onClick={formatNumberedList}
              active={blockType === 'number'}
              icon={blockTypeToIcon.number}
            />
            <ToolbarButton
              onClick={formatQuote}
              active={blockType === 'quote'}
              icon={blockTypeToIcon.quote}
            />
            <ToolbarButton
              onClick={formatCode}
              active={blockType === 'code'}
              icon={blockTypeToIcon.code}
            />
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
  const intl = useIntl();
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
    <div
      ref={popupCharStylesEditorRef}
      className='absolute left-0 top-0 z-10 flex h-[38px] gap-0.5 rounded-lg bg-white p-1 opacity-0 shadow-lg transition-[opacity] dark:bg-gray-900'
    >
      {editor.isEditable() && (
        <>
          <BlockTypeDropdown
            editor={editor}
            anchorElem={anchorElem}
            blockType={blockType}
            icon={blockTypeToIcon[blockType]}
          />
          <ToolbarButton
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            }}
            active={isBold}
            aria-label={intl.formatMessage(messages.formatBold)}
            icon={require('@tabler/icons/bold.svg')}
          />
          <ToolbarButton
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            }}
            active={isItalic}
            aria-label={intl.formatMessage(messages.formatItalic)}
            icon={require('@tabler/icons/italic.svg')}
          />
          <ToolbarButton
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            }}
            active={isUnderline}
            aria-label={intl.formatMessage(messages.formatUnderline)}
            icon={require('@tabler/icons/underline.svg')}
          />
          <ToolbarButton
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            }}
            active={isStrikethrough}
            aria-label={intl.formatMessage(messages.formatStrikethrough)}
            icon={require('@tabler/icons/strikethrough.svg')}
          />
          <ToolbarButton
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
            }}
            active={isCode}
            aria-label={intl.formatMessage(messages.insertCodeBlock)}
            icon={require('@tabler/icons/code.svg')}
          />
          <ToolbarButton
            onClick={insertLink}
            active={isLink}
            aria-label={intl.formatMessage(messages.insertLink)}
            icon={require('@tabler/icons/link.svg')}
          />
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
