/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  QueryMatch,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { fetchComposeSuggestions } from 'soapbox/actions/compose';
import { useAppDispatch, useCompose } from 'soapbox/hooks';

import AutosuggestAccount from '../../components/autosuggest-account';
import { $createMentionNode, MentionNode } from '../nodes/mention-node';

import { TypeaheadMenuPlugin } from './typeahead-menu-plugin';

import type { RangeSelection, TextNode } from 'lexical';

const REGEX = new RegExp('(^|$|(?:^|\\s))([@])([a-z\\d_-]+(?:@[^@\\s]+)?)', 'i');

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;';
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']';

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const CapitalizedNameMentionsRegex = new RegExp(
  '(^|[^#])((?:' + DocumentMentionsRegex.NAME + '{' + 1 + ',})$)',
);

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGERS = ['@'].join('');

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]';

const AtSignMentionsRegex = REGEX;

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50;

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    '){0,' +
    ALIAS_LENGTH_LIMIT +
    '})' +
    ')$',
);

const mentionsCache = new Map();

const dummyMentionsData = ['Test'];

const dummyLookupService = {
  search(string: string, callback: (results: Array<string>) => void): void {
    setTimeout(() => {
      const results = dummyMentionsData.filter((mention) =>
        mention.toLowerCase().includes(string.toLowerCase()),
      );
      callback(results);
    }, 500);
  },
};

const useMentionLookupService = (mentionString: string | null) => {
  const [results, setResults] = useState<Array<string>>([]);

  useEffect(() => {
    const cachedResults = mentionsCache.get(mentionString);

    if (mentionString === null) {
      setResults([]);
      return;
    }

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    mentionsCache.set(mentionString, null);
    dummyLookupService.search(mentionString, (newResults) => {
      mentionsCache.set(mentionString, newResults);
      setResults(newResults);
    });
  }, [mentionString]);

  return results;
};

const checkForCapitalizedNameMentions = (
  text: string,
  minMatchLength: number,
): QueryMatch | null => {
  const match = CapitalizedNameMentionsRegex.exec(text);
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[2];
    if (matchingString !== null && matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: matchingString,
      };
    }
  }
  return null;
};

const checkForAtSignMentions = (
  text: string,
  minMatchLength: number,
): QueryMatch | null => {
  let match = AtSignMentionsRegex.exec(text);
  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text);
  }
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[3];
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }
  return null;
};

const getPossibleQueryMatch = (text: string): QueryMatch | null => {
  const match = checkForAtSignMentions(text, 1);
  return match === null ? checkForCapitalizedNameMentions(text, 3) : match;
};

class MentionTypeaheadOption extends TypeaheadOption {

  name: string;
  picture: JSX.Element;

  constructor(name: string, picture: JSX.Element) {
    super(name);
    this.name = name;
    this.picture = picture;
  }

}

export const MentionPlugin: React.FC<{
  composeId: string
  suggestionsHidden: boolean
  setSuggestionsHidden: (value: boolean) => void
}> = ({
  composeId, suggestionsHidden, setSuggestionsHidden,
}): JSX.Element | null => {
  const { suggestions } = useCompose(composeId);
  const dispatch = useAppDispatch();

  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);
  const [selectedSuggestion] = useState(0);

  const results = useMentionLookupService(queryString);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = [new MentionTypeaheadOption('', <i className='icon user' />)];

  const onSelectOption = useCallback(() => { }, [editor]);

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

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const mentionMatch = getPossibleQueryMatch(text);
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      return !slashMatch && mentionMatch ? mentionMatch : null;
    },
    [checkForSlashTriggerMatch, editor],
  );

  useEffect(() => {
    if (!editor.hasNodes([MentionNode])) {
      throw new Error('MentionPlugin: MentionNode not registered on editor');
    }
  }, [editor]);

  const createMentionNode = useCallback((textNode: TextNode): MentionNode => {
    return $createMentionNode(textNode.getTextContent());
  }, []);

  const getMentionMatch = useCallback((text: string) => {
    const matchArr = REGEX.exec(text);

    if (matchArr === null) {
      return null;
    }

    dispatch(fetchComposeSuggestions(composeId, matchArr[0]));

    const mentionLength = matchArr[3].length + 1;
    const startOffset = matchArr.index + matchArr[1].length;
    const endOffset = startOffset + mentionLength;
    return {
      end: endOffset,
      start: startOffset,
    };
  }, []);

  useLexicalTextEntity<MentionNode>(
    getMentionMatch,
    MentionNode,
    createMentionNode,
  );

  const renderSuggestion = (suggestion: string, i: number) => {
    const inner = <AutosuggestAccount id={suggestion} />;
    const key = suggestion;

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

  useEffect(() => {
    if (suggestions && suggestions.size > 0) setSuggestionsHidden(false);
  }, [suggestions]);

  return (
    <TypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) =>
        anchorElementRef.current && results.length
          ? ReactDOM.createPortal(
            <div
              // style={setPortalPosition()}
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
};
