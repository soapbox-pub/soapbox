/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import clsx from 'clsx';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  LexicalEditor,
  RangeSelection,
} from 'lexical';
import React, {
  MutableRefObject,
  ReactPortal,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';

import { fetchComposeSuggestions } from 'soapbox/actions/compose';
import AutosuggestEmoji from 'soapbox/components/autosuggest-emoji';
import { useAppDispatch, useCompose } from 'soapbox/hooks';

import AutosuggestAccount from '../../components/autosuggest-account';

import { MENTION_REGEX } from './mention-plugin';

import type { AutoSuggestion } from 'soapbox/components/autosuggest-input';


const EMOJI_REGEX = new RegExp('(^|$|(?:^|\\s))([:])([a-z\\d_-]+([:]?))', 'i');

export type QueryMatch = {
  leadOffset: number
  matchingString: string
};

export type Resolution = {
  match: QueryMatch
  getRect: () => DOMRect
};

export type MenuRenderFn = (
  anchorElementRef: MutableRefObject<HTMLElement | null>,
) => ReactPortal | JSX.Element | null;

function tryToPositionRange(leadOffset: number, range: Range): boolean {
  const domSelection = window.getSelection();
  if (domSelection === null || !domSelection.isCollapsed) {
    return false;
  }
  const anchorNode = domSelection.anchorNode;
  const startOffset = leadOffset;
  const endOffset = domSelection.anchorOffset;

  if (!anchorNode || !endOffset) {
    return false;
  }

  try {
    range.setStart(anchorNode, startOffset);
    range.setEnd(anchorNode, endOffset);
  } catch (error) {
    return false;
  }

  return true;
}

function getQueryTextForSearch(editor: LexicalEditor): string | null {
  const state = editor.getEditorState();
  const node = (state._selection as RangeSelection)?.anchor?.getNode();

  if (node && (node.getType() === 'mention' || node.getType() === 'text')) return node.getTextContent();

  return null;
}

function isSelectionOnEntityBoundary(
  editor: LexicalEditor,
  offset: number,
): boolean {
  if (offset !== 0) {
    return false;
  }
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor;
      const anchorNode = anchor.getNode();
      const prevSibling = anchorNode.getPreviousSibling();
      return $isTextNode(prevSibling) && prevSibling.isTextEntity();
    }
    return false;
  });
}

function startTransition(callback: () => void) {
  if (React.startTransition) {
    React.startTransition(callback);
  } else {
    callback();
  }
}

// Got from https://stackoverflow.com/a/42543908/2013580
export function getScrollParent(
  element: HTMLElement,
  includeHidden: boolean,
): HTMLElement | HTMLBodyElement {
  let style = getComputedStyle(element);
  const excludeStaticParent = style.position === 'absolute';
  const overflowRegex = includeHidden
    ? /(auto|scroll|hidden)/
    : /(auto|scroll)/;
  if (style.position === 'fixed') {
    return document.body;
  }
  for (
    let parent: HTMLElement | null = element;
    (parent = parent.parentElement);

  ) {
    style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === 'static') {
      continue;
    }
    if (
      overflowRegex.test(style.overflow + style.overflowY + style.overflowX)
    ) {
      return parent;
    }
  }
  return document.body;
}

function isTriggerVisibleInNearestScrollContainer(
  targetElement: HTMLElement,
  containerElement: HTMLElement,
): boolean {
  const tRect = targetElement.getBoundingClientRect();
  const cRect = containerElement.getBoundingClientRect();
  return tRect.top > cRect.top && tRect.top < cRect.bottom;
}

// Reposition the menu on scroll, window resize, and element resize.
export function useDynamicPositioning(
  resolution: Resolution | null,
  targetElement: HTMLElement | null,
  onReposition: () => void,
  onVisibilityChange?: (isInView: boolean) => void,
) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (targetElement && resolution) {
      const rootElement = editor.getRootElement();
      const rootScrollParent =
        rootElement
          ? getScrollParent(rootElement, false)
          : document.body;
      let ticking = false;
      let previousIsInView = isTriggerVisibleInNearestScrollContainer(
        targetElement,
        rootScrollParent,
      );
      const handleScroll = function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            onReposition();
            ticking = false;
          });
          ticking = true;
        }
        const isInView = isTriggerVisibleInNearestScrollContainer(
          targetElement,
          rootScrollParent,
        );
        if (isInView !== previousIsInView) {
          previousIsInView = isInView;
          if (onVisibilityChange) {
            onVisibilityChange(isInView);
          }
        }
      };
      const resizeObserver = new ResizeObserver(onReposition);
      window.addEventListener('resize', onReposition);
      document.addEventListener('scroll', handleScroll, {
        capture: true,
        passive: true,
      });
      resizeObserver.observe(targetElement);
      return () => {
        resizeObserver.unobserve(targetElement);
        window.removeEventListener('resize', onReposition);
        document.removeEventListener('scroll', handleScroll);
      };
    }
  }, [targetElement, editor, onVisibilityChange, onReposition, resolution]);
}

function LexicalPopoverMenu({
  anchorElementRef,
  menuRenderFn,
}: {
  anchorElementRef: MutableRefObject<HTMLElement>
  menuRenderFn: MenuRenderFn
}): JSX.Element | null {
  return menuRenderFn(anchorElementRef);
}

function useMenuAnchorRef(
  resolution: Resolution | null,
  setResolution: (r: Resolution | null) => void,
): MutableRefObject<HTMLElement> {
  const [editor] = useLexicalComposerContext();
  const anchorElementRef = useRef<HTMLElement>(document.createElement('div'));
  const positionMenu = useCallback(() => {
    const rootElement = editor.getRootElement();
    const containerDiv = anchorElementRef.current;

    if (rootElement !== null && resolution !== null) {
      const { left, top, width, height } = resolution.getRect();
      containerDiv.style.top = `${top + window.pageYOffset}px`;
      containerDiv.style.left = `${left + window.pageXOffset}px`;
      containerDiv.style.height = `${height}px`;
      containerDiv.style.width = `${width}px`;

      if (!containerDiv.isConnected) {
        containerDiv.setAttribute('aria-label', 'Typeahead menu');
        containerDiv.setAttribute('id', 'typeahead-menu');
        containerDiv.setAttribute('role', 'listbox');
        containerDiv.style.display = 'block';
        containerDiv.style.position = 'absolute';
        document.body.append(containerDiv);
      }
      anchorElementRef.current = containerDiv;
      rootElement.setAttribute('aria-controls', 'typeahead-menu');
    }
  }, [editor, resolution]);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (resolution !== null) {
      positionMenu();
      return () => {
        if (rootElement !== null) {
          rootElement.removeAttribute('aria-controls');
        }

        const containerDiv = anchorElementRef.current;
        if (containerDiv !== null && containerDiv.isConnected) {
          containerDiv.remove();
        }
      };
    }
  }, [editor, positionMenu, resolution]);

  const onVisibilityChange = useCallback(
    (isInView: boolean) => {
      if (resolution !== null) {
        if (!isInView) {
          setResolution(null);
        }
      }
    },
    [resolution, setResolution],
  );

  useDynamicPositioning(
    resolution,
    anchorElementRef.current,
    positionMenu,
    onVisibilityChange,
  );

  return anchorElementRef;
}

export type AutosuggestPluginProps = {
  composeId: string
  suggestionsHidden: boolean
  setSuggestionsHidden: (value: boolean) => void
};

export function AutosuggestPlugin({
  composeId,
  suggestionsHidden,
  setSuggestionsHidden,
}: AutosuggestPluginProps): JSX.Element | null {
  const { suggestions } = useCompose(composeId);
  const dispatch = useAppDispatch();

  const [editor] = useLexicalComposerContext();
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [selectedSuggestion] = useState(0);
  const anchorElementRef = useMenuAnchorRef(
    resolution,
    setResolution,
  );

  const onSelectSuggestion: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();

    const suggestion = suggestions.get(e.currentTarget.getAttribute('data-index') as any);

    editor.update(() => {

      dispatch((_, getState) => {
        const state = editor.getEditorState();
        const node = (state._selection as RangeSelection)?.anchor?.getNode();

        const content = getState().accounts.get(suggestion)!.acct;

        node.setTextContent(`@${content} `);
        node.select();
      });
    });
  };

  const checkForMatch = useCallback((text: string) => {
    const matchArr = MENTION_REGEX.exec(text) || EMOJI_REGEX.exec(text);

    if (!matchArr) return null;

    dispatch(fetchComposeSuggestions(composeId, matchArr[0]?.trim()));

    return {
      leadOffset: matchArr.index,
      matchingString: matchArr[0],
    };
  }, []);

  const renderSuggestion = (suggestion: AutoSuggestion, i: number) => {
    let inner;
    let key;

    if (typeof suggestion === 'object') {
      inner = <AutosuggestEmoji emoji={suggestion} />;
      key = suggestion.id;
    } else {
      inner = <AutosuggestAccount id={suggestion} />;
      key = suggestion;
    }

    return (
      <div
        role='button'
        tabIndex={0}
        key={key}
        data-index={i}
        className={clsx({
          'px-4 py-2.5 text-sm text-gray-700 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-primary-800 group': true,
          'bg-gray-100 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800': i === selectedSuggestion,
        })}
        onMouseDown={onSelectSuggestion}
      >
        {inner}
      </div>
    );
  };

  const closeTypeahead = useCallback(() => {
    setResolution(null);
  }, [resolution]);

  const openTypeahead = useCallback(
    (res: Resolution) => {
      setResolution(res);
    },
    [resolution],
  );

  useEffect(() => {
    const updateListener = () => {
      editor.getEditorState().read(() => {
        const range = document.createRange();
        const text = getQueryTextForSearch(editor);

        if (!text) {
          closeTypeahead();
          return;
        }

        const match = checkForMatch(text);

        if (
          match !== null &&
          !isSelectionOnEntityBoundary(editor, match.leadOffset)
        ) {
          const isRangePositioned = tryToPositionRange(match.leadOffset, range);
          if (isRangePositioned !== null) {
            startTransition(() =>
              openTypeahead({
                getRect: () => range.getBoundingClientRect(),
                match,
              }),
            );
            return;
          }
        }
        closeTypeahead();
      });
    };

    const removeUpdateListener = editor.registerUpdateListener(updateListener);

    return () => {
      removeUpdateListener();
    };
  }, [
    editor,
    resolution,
    closeTypeahead,
    openTypeahead,
  ]);

  useEffect(() => {
    if (suggestions && suggestions.size > 0) setSuggestionsHidden(false);
  }, [suggestions]);

  return resolution === null || editor === null ? null : (
    <LexicalPopoverMenu
      anchorElementRef={anchorElementRef}
      menuRenderFn={(anchorElementRef) =>
        anchorElementRef.current
          ? ReactDOM.createPortal(
            <div
              className={clsx({
                'mt-6 fixed z-1000 shadow bg-white dark:bg-gray-900 rounded-lg py-1 space-y-0 dark:ring-2 dark:ring-primary-700 focus:outline-none': true,
                hidden: suggestionsHidden || suggestions.isEmpty(),
                block: !suggestionsHidden && !suggestions.isEmpty(),
              })}
            >
              {suggestions.map(renderSuggestion)}
            </div>,
            anchorElementRef.current,
          )
          : null
      }
    />
  );
}
