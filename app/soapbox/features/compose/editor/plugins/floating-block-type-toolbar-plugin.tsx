/*
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

This source code is licensed under the MIT license found in the
LICENSE file in the /app/soapbox/features/compose/editor directory.
*/

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  DEPRECATED_$isGridSelection,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { useIntl } from 'react-intl';

import { uploadFile } from 'soapbox/actions/compose';
import { useAppDispatch, useInstance } from 'soapbox/hooks';

import { onlyImages } from '../../components/upload-button';
import { $createImageNode } from '../nodes/image-node';
import { setFloatingElemPosition } from '../utils/set-floating-elem-position';

import { ToolbarButton } from './floating-text-format-toolbar-plugin';

import type { List as ImmutableList } from 'immutable';

interface IUploadButton {
  onSelectFile: (src: string) =>  void
}

const UploadButton: React.FC<IUploadButton> = ({ onSelectFile }) => {
  const intl = useIntl();
  const { configuration } = useInstance();
  const dispatch = useAppDispatch();

  const fileElement = useRef<HTMLInputElement>(null);
  const attachmentTypes = configuration.getIn(['media_attachments', 'supported_mime_types']) as ImmutableList<string>;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.length) {
      // @ts-ignore
      dispatch(uploadFile(
        e.target.files.item(0) as File,
        intl,
        ({ url }) => onSelectFile(url),
      ));
    }
  };

  const handleClick = () => {
    fileElement.current?.click();
  };

  // if (unavailable) {
  //   return null;
  // }

  const src = (
    onlyImages(attachmentTypes)
      ? require('@tabler/icons/photo.svg')
      : require('@tabler/icons/paperclip.svg')
  );

  return (
    <label>
      <ToolbarButton
        onClick={handleClick}
        aria-label='Upload media'
        icon={src}
      />
      <input
        // key={resetFileKey}
        ref={fileElement}
        type='file'
        multiple
        accept={attachmentTypes && attachmentTypes.toArray().join(',')}
        onChange={handleChange}
        // disabled={disabled}
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
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

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
        const selectionNode = selection.anchor.getNode();
        selectionNode.replace($createImageNode({ altText: '', src }));
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
          <ToolbarButton
            onClick={createHorizontalLine}
            aria-label='Insert horizontal line'
            icon={require('@tabler/icons/line-dashed.svg')}
          />
          <UploadButton onSelectFile={createImage} />
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
