/**
 * This source code is derived from code from Meta Platforms, Inc.
 * and affiliates, licensed under the MIT license located in the
 * LICENSE file in the /app/soapbox/features/compose/editor directory.
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_LOW,
  DEPRECATED_$isGridSelection,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { defineMessages, useIntl } from 'react-intl';

import { uploadFile } from 'soapbox/actions/compose';
import { useAppDispatch, useInstance } from 'soapbox/hooks';

import { $createImageNode } from '../nodes/image-node';
import { setFloatingElemPosition } from '../utils/set-floating-elem-position';

import { ToolbarButton } from './floating-text-format-toolbar-plugin';

import type { List as ImmutableList } from 'immutable';

const messages = defineMessages({
  createHorizontalLine: { id: 'compose_form.lexical.create_horizontal_line', defaultMessage: 'Create horizontal line' },
  uploadMedia: { id: 'compose_form.lexical.upload_media', defaultMessage: 'Upload media' },
});

interface IUploadButton {
  onSelectFile: (src: string) =>  void
}

const UploadButton: React.FC<IUploadButton> = ({ onSelectFile }) => {
  const intl = useIntl();
  const { configuration } = useInstance();
  const dispatch = useAppDispatch();
  const [disabled, setDisabled] = useState(false);

  const fileElement = useRef<HTMLInputElement>(null);
  const attachmentTypes = configuration.getIn(['media_attachments', 'supported_mime_types']) as ImmutableList<string>;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.length) {
      setDisabled(true);

      // @ts-ignore
      dispatch(uploadFile(
        e.target.files.item(0) as File,
        intl,
        ({ url }) => {
          onSelectFile(url);
          setDisabled(false);
        },
        () => setDisabled(false),
      ));
    }
  };

  const handleClick = () => {
    fileElement.current?.click();
  };

  const src = require('@tabler/icons/photo.svg');

  return (
    <label>
      <ToolbarButton
        onClick={handleClick}
        aria-label={intl.formatMessage(messages.uploadMedia)}
        icon={src}
      />
      <input
        ref={fileElement}
        type='file'
        multiple
        accept={attachmentTypes ? attachmentTypes.filter(type => type.startsWith('image/')).toArray().join(',') : 'image/*'}
        onChange={handleChange}
        disabled={disabled}
        className='hidden'
      />
    </label>
  );
};

const BlockTypeFloatingToolbar = ({
  editor,
  anchorElem,
}: {
   editor: LexicalEditor
   anchorElem: HTMLElement
 }): JSX.Element => {
  const intl = useIntl();
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);
  const instance = useInstance();

  const allowInlineImages = instance.pleroma.getIn(['metadata', 'markup', 'allow_inline_images']);

  const updateBlockTypeFloatingToolbar = useCallback(() => {
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
      !nativeSelection.anchorNode?.textContent &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      setFloatingElemPosition((nativeSelection.focusNode as HTMLParagraphElement)?.getBoundingClientRect(), popupCharStylesEditorElem, anchorElem);
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateBlockTypeFloatingToolbar();
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
  }, [editor, updateBlockTypeFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateBlockTypeFloatingToolbar();
    });

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateBlockTypeFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateBlockTypeFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updateBlockTypeFloatingToolbar]);

  const createHorizontalLine = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
        const selectionNode = selection.anchor.getNode();
        selectionNode.replace($createHorizontalRuleNode());
      }
    });
  };

  const createImage = (src: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
        const imageNode = $createImageNode({ altText: '', src });
        $insertNodes([imageNode]);
        if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
          $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
        }
      }
    });
  };

  return (
    <div
      ref={popupCharStylesEditorRef}
      className='absolute left-0 top-0 z-10 flex h-[38px] gap-0.5 rounded-lg bg-white p-1 opacity-0 shadow-lg transition-[opacity] dark:bg-gray-900'
    >
      {editor.isEditable() && (
        <>
          {allowInlineImages && <UploadButton onSelectFile={createImage} />}
          <ToolbarButton
            onClick={createHorizontalLine}
            aria-label={intl.formatMessage(messages.createHorizontalLine)}
            icon={require('@tabler/icons/line-dashed.svg')}
          />
        </>
      )}
    </div>
  );
};

const useFloatingBlockTypeToolbar = (
  editor: LexicalEditor,
  anchorElem: HTMLElement,
): JSX.Element | null => {
  const [isEmptyBlock, setIsEmptyBlock] = useState(false);

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
        setIsEmptyBlock(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const anchorNode = selection.anchor.getNode();

      setIsEmptyBlock(anchorNode.getType() === 'paragraph' && anchorNode.getTextContentSize() === 0);
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
          setIsEmptyBlock(false);
        }
      }),
    );
  }, [editor, updatePopup]);

  if (!isEmptyBlock) {
    return null;
  }

  return createPortal(
    <BlockTypeFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
    />,
    anchorElem,
  );
};

const FloatingBlockTypeToolbarPlugin = ({
  anchorElem = document.body,
}: {
   anchorElem?: HTMLElement
 }): JSX.Element | null => {
  const [editor] = useLexicalComposerContext();
  return useFloatingBlockTypeToolbar(editor, anchorElem);
};

export default FloatingBlockTypeToolbarPlugin;
