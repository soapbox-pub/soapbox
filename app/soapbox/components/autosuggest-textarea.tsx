import clsx from 'clsx';
import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Textarea from 'react-textarea-autosize';

import { Portal } from 'soapbox/components/ui';
import AutosuggestAccount from 'soapbox/features/compose/components/autosuggest-account';
import { isRtl } from 'soapbox/rtl';
import { textAtCursorMatchesToken } from 'soapbox/utils/suggestions';

import AutosuggestEmoji from './autosuggest-emoji';

import type { List as ImmutableList } from 'immutable';
import type { Emoji } from 'soapbox/features/emoji';

interface IAutosuggesteTextarea {
  id?: string
  value: string
  suggestions: ImmutableList<string>
  disabled: boolean
  placeholder: string
  onSuggestionSelected: (tokenStart: number, token: string | null, value: string | undefined) => void
  onSuggestionsClearRequested: () => void
  onSuggestionsFetchRequested: (token: string | number) => void
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>
  onPaste: (files: FileList) => void
  autoFocus: boolean
  onFocus: () => void
  onBlur?: () => void
  condensed?: boolean
  children: React.ReactNode
}

class AutosuggestTextarea extends ImmutablePureComponent<IAutosuggesteTextarea> {

  textarea: HTMLTextAreaElement | null = null;

  static defaultProps = {
    autoFocus: true,
  };

  state = {
    suggestionsHidden: true,
    focused: false,
    selectedSuggestion: 0,
    lastToken: null,
    tokenStart: 0,
  };

  onChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const [tokenStart, token] = textAtCursorMatchesToken(
      e.target.value,
      e.target.selectionStart,
      ['@', ':', '#'],
    );

    if (token !== null && this.state.lastToken !== token) {
      this.setState({ lastToken: token, selectedSuggestion: 0, tokenStart });
      this.props.onSuggestionsFetchRequested(token);
    } else if (token === null) {
      this.setState({ lastToken: null });
      this.props.onSuggestionsClearRequested();
    }

    this.props.onChange(e);
  };

  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    const { suggestions, disabled } = this.props;
    const { selectedSuggestion, suggestionsHidden } = this.state;

    if (disabled) {
      e.preventDefault();
      return;
    }

    if (e.which === 229 || (e as any).isComposing) {
      // Ignore key events during text composition
      // e.key may be a name of the physical key even in this case (e.x. Safari / Chrome on Mac)
      return;
    }

    switch (e.key) {
      case 'Escape':
        if (suggestions.size === 0 || suggestionsHidden) {
          document.querySelector('.ui')?.parentElement?.focus();
        } else {
          e.preventDefault();
          this.setState({ suggestionsHidden: true });
        }

        break;
      case 'ArrowDown':
        if (suggestions.size > 0 && !suggestionsHidden) {
          e.preventDefault();
          this.setState({ selectedSuggestion: Math.min(selectedSuggestion + 1, suggestions.size - 1) });
        }

        break;
      case 'ArrowUp':
        if (suggestions.size > 0 && !suggestionsHidden) {
          e.preventDefault();
          this.setState({ selectedSuggestion: Math.max(selectedSuggestion - 1, 0) });
        }

        break;
      case 'Enter':
      case 'Tab':
        // Select suggestion
        if (this.state.lastToken !== null && suggestions.size > 0 && !suggestionsHidden) {
          e.preventDefault();
          e.stopPropagation();
          this.props.onSuggestionSelected(this.state.tokenStart, this.state.lastToken, suggestions.get(selectedSuggestion));
        }

        break;
    }

    if (e.defaultPrevented || !this.props.onKeyDown) {
      return;
    }

    this.props.onKeyDown(e);
  };

  onBlur = () => {
    this.setState({ suggestionsHidden: true, focused: false });

    if (this.props.onBlur) {
      this.props.onBlur();
    }
  };

  onFocus = () => {
    this.setState({ focused: true });

    if (this.props.onFocus) {
      this.props.onFocus();
    }
  };

  onSuggestionClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const suggestion = this.props.suggestions.get(e.currentTarget.getAttribute('data-index') as any);
    e.preventDefault();
    this.props.onSuggestionSelected(this.state.tokenStart, this.state.lastToken, suggestion);
    this.textarea?.focus();
  };

  shouldComponentUpdate(nextProps: IAutosuggesteTextarea, nextState: any) {
    // Skip updating when only the lastToken changes so the
    // cursor doesn't jump around due to re-rendering unnecessarily
    const lastTokenUpdated = this.state.lastToken !== nextState.lastToken;
    const valueUpdated = this.props.value !== nextProps.value;

    if (lastTokenUpdated && !valueUpdated) {
      return false;
    } else {
      // https://stackoverflow.com/a/35962835
      return super.shouldComponentUpdate!.bind(this)(nextProps, nextState, undefined);
    }
  }

  componentDidUpdate(prevProps: IAutosuggesteTextarea, prevState: any) {
    const { suggestions } = this.props;
    if (suggestions !== prevProps.suggestions && suggestions.size > 0 && prevState.suggestionsHidden && prevState.focused) {
      this.setState({ suggestionsHidden: false });
    }
  }

  setTextarea: React.Ref<HTMLTextAreaElement> = (c) => {
    this.textarea = c;
  };

  onPaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.clipboardData && e.clipboardData.files.length === 1) {
      this.props.onPaste(e.clipboardData.files);
      e.preventDefault();
    }
  };

  renderSuggestion = (suggestion: string | Emoji, i: number) => {
    const { selectedSuggestion } = this.state;
    let inner, key;

    if (typeof suggestion === 'object') {
      inner = <AutosuggestEmoji emoji={suggestion} />;
      key = suggestion.id;
    } else if (suggestion[0] === '#') {
      inner = suggestion;
      key = suggestion;
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
        onMouseDown={this.onSuggestionClick}
      >
        {inner}
      </div>
    );
  };

  setPortalPosition() {
    if (!this.textarea) {
      return {};
    }

    const { top, height, left, width } = this.textarea.getBoundingClientRect();

    return {
      top: top + height,
      left,
      width,
    };
  }

  render() {
    const { value, suggestions, disabled, placeholder, onKeyUp, autoFocus, children, condensed, id } = this.props;
    const { suggestionsHidden } = this.state;
    const style = { direction: 'ltr', minRows: 10 };

    // TODO: convert to functional component and use `useLocale()` hook instead of checking placeholder text.
    if (isRtl(value) || (!value && placeholder && isRtl(placeholder))) {
      style.direction = 'rtl';
    }

    return [
      <div key='textarea'>
        <div className='relative'>
          <label>
            <span style={{ display: 'none' }}>{placeholder}</span>

            <Textarea
              ref={this.setTextarea}
              className={clsx('w-full resize-none border-0 px-0 text-gray-800 transition-[min-height] placeholder:text-gray-600 focus:border-0 focus:shadow-none focus:ring-0 motion-reduce:transition-none dark:bg-transparent dark:text-white dark:placeholder:text-gray-600', {
                'min-h-[40px]': condensed,
                'min-h-[100px]': !condensed,
              })}
              id={id}
              disabled={disabled}
              placeholder={placeholder}
              autoFocus={autoFocus}
              value={value}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              onKeyUp={onKeyUp}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              onPaste={this.onPaste}
              style={style as any}
              aria-autocomplete='list'
            />
          </label>
        </div>

        {children}
      </div>,

      <Portal key='portal'>
        <div
          style={this.setPortalPosition()}
          className={clsx({
            'fixed z-1000 shadow bg-white dark:bg-gray-900 rounded-lg py-1 space-y-0 dark:ring-2 dark:ring-primary-700 focus:outline-none': true,
            hidden: suggestionsHidden || suggestions.isEmpty(),
            block: !suggestionsHidden && !suggestions.isEmpty(),
          })}
        >
          {suggestions.map(this.renderSuggestion)}
        </div>
      </Portal>,
    ];
  }

}

export default AutosuggestTextarea;
