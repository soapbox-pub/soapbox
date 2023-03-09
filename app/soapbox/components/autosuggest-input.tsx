import clsx from 'clsx';
import { List as ImmutableList } from 'immutable';
import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';

import AutosuggestEmoji from 'soapbox/components/autosuggest-emoji';
import Icon from 'soapbox/components/icon';
import { Input, Portal } from 'soapbox/components/ui';
import AutosuggestAccount from 'soapbox/features/compose/components/autosuggest-account';
import { isRtl } from 'soapbox/rtl';
import { textAtCursorMatchesToken } from 'soapbox/utils/suggestions';

import type { Menu, MenuItem } from 'soapbox/components/dropdown-menu';
import type { InputThemes } from 'soapbox/components/ui/input/input';
import type { Emoji } from 'soapbox/features/emoji';

export type AutoSuggestion = string | Emoji;

export interface IAutosuggestInput extends Pick<React.HTMLAttributes<HTMLInputElement>, 'onChange' | 'onKeyUp' | 'onKeyDown'> {
  value: string
  suggestions: ImmutableList<any>
  disabled?: boolean
  placeholder?: string
  onSuggestionSelected: (tokenStart: number, lastToken: string | null, suggestion: AutoSuggestion) => void
  onSuggestionsClearRequested: () => void
  onSuggestionsFetchRequested: (token: string) => void
  autoFocus: boolean
  autoSelect: boolean
  className?: string
  id?: string
  searchTokens: string[]
  maxLength?: number
  menu?: Menu
  renderSuggestion?: React.FC<{ id: string }>
  hidePortal?: boolean
  theme?: InputThemes
}

export default class AutosuggestInput extends ImmutablePureComponent<IAutosuggestInput> {

  static defaultProps = {
    autoFocus: false,
    autoSelect: true,
    searchTokens: ImmutableList(['@', ':', '#']),
  };

  getFirstIndex = () => {
    return this.props.autoSelect ? 0 : -1;
  };

  state = {
    suggestionsHidden: true,
    focused: false,
    selectedSuggestion: this.getFirstIndex(),
    lastToken: null,
    tokenStart: 0,
  };

  input: HTMLInputElement | null = null;

  onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const [tokenStart, token] = textAtCursorMatchesToken(
      e.target.value,
      e.target.selectionStart || 0,
      this.props.searchTokens,
    );

    if (token !== null && this.state.lastToken !== token) {
      this.setState({ lastToken: token, selectedSuggestion: 0, tokenStart });
      this.props.onSuggestionsFetchRequested(token);
    } else if (token === null) {
      this.setState({ lastToken: null });
      this.props.onSuggestionsClearRequested();
    }

    if (this.props.onChange) {
      this.props.onChange(e);
    }
  };

  onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const { suggestions, menu, disabled } = this.props;
    const { selectedSuggestion, suggestionsHidden } = this.state;
    const firstIndex = this.getFirstIndex();
    const lastIndex = suggestions.size + (menu || []).length - 1;

    if (disabled) {
      e.preventDefault();
      return;
    }

    if (e.which === 229) {
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
        if (!suggestionsHidden && (suggestions.size > 0 || menu)) {
          e.preventDefault();
          this.setState({ selectedSuggestion: Math.min(selectedSuggestion + 1, lastIndex) });
        }

        break;
      case 'ArrowUp':
        if (!suggestionsHidden && (suggestions.size > 0 || menu)) {
          e.preventDefault();
          this.setState({ selectedSuggestion: Math.max(selectedSuggestion - 1, firstIndex) });
        }

        break;
      case 'Enter':
      case 'Tab':
        // Select suggestion
        if (!suggestionsHidden && selectedSuggestion > -1 && (suggestions.size > 0 || menu)) {
          e.preventDefault();
          e.stopPropagation();
          this.setState({ selectedSuggestion: firstIndex });

          if (selectedSuggestion < suggestions.size) {
            this.props.onSuggestionSelected(this.state.tokenStart, this.state.lastToken, suggestions.get(selectedSuggestion));
          } else if (menu) {
            const item = menu[selectedSuggestion - suggestions.size];
            this.handleMenuItemAction(item, e);
          }
        }

        break;
    }

    if (e.defaultPrevented || !this.props.onKeyDown) {
      return;
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);
    }
  };

  onBlur = () => {
    this.setState({ suggestionsHidden: true, focused: false });
  };

  onFocus = () => {
    this.setState({ focused: true });
  };

  onSuggestionClick: React.EventHandler<React.MouseEvent | React.TouchEvent> = (e) => {
    const index = Number(e.currentTarget?.getAttribute('data-index'));
    const suggestion = this.props.suggestions.get(index);
    this.props.onSuggestionSelected(this.state.tokenStart, this.state.lastToken, suggestion);
    this.input?.focus();
    e.preventDefault();
  };

  componentDidUpdate(prevProps: IAutosuggestInput, prevState: any) {
    const { suggestions } = this.props;
    if (suggestions !== prevProps.suggestions && suggestions.size > 0 && prevState.suggestionsHidden && prevState.focused) {
      this.setState({ suggestionsHidden: false });
    }
  }

  setInput = (c: HTMLInputElement) => {
    this.input = c;
  };

  renderSuggestion = (suggestion: AutoSuggestion, i: number) => {
    const { selectedSuggestion } = this.state;
    let inner, key;

    if (this.props.renderSuggestion && typeof suggestion === 'string') {
      const RenderSuggestion = this.props.renderSuggestion;
      inner = <RenderSuggestion id={suggestion} />;
      key = suggestion;
    } else if (typeof suggestion === 'object') {
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
        onTouchEnd={this.onSuggestionClick}
      >
        {inner}
      </div>
    );
  };

  handleMenuItemAction = (item: MenuItem | null, e: React.MouseEvent | React.KeyboardEvent) => {
    this.onBlur();
    if (item?.action) {
      item.action(e);
    }
  };

  handleMenuItemClick = (item: MenuItem | null): React.MouseEventHandler => {
    return e => {
      e.preventDefault();
      this.handleMenuItemAction(item, e);
    };
  };

  renderMenu = () => {
    const { menu, suggestions } = this.props;
    const { selectedSuggestion } = this.state;

    if (!menu) {
      return null;
    }

    return menu.map((item, i) => (
      <a
        className={clsx('flex cursor-pointer items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800 dark:focus:bg-primary-800', { selected: suggestions.size - selectedSuggestion === i })}
        href='#'
        role='button'
        tabIndex={0}
        onMouseDown={this.handleMenuItemClick(item)}
        key={i}
      >
        {item?.icon && (
          <Icon src={item.icon} />
        )}

        <span>{item?.text}</span>
      </a>
    ));
  };

  setPortalPosition() {
    if (!this.input) {
      return {};
    }

    const { top, height, left, width } = this.input.getBoundingClientRect();

    return { left, width, top: top + height };
  }

  render() {
    const { value, suggestions, disabled, placeholder, onKeyUp, autoFocus, className, id, maxLength, menu, theme } = this.props;
    const { suggestionsHidden } = this.state;
    const style: React.CSSProperties = { direction: 'ltr' };

    const visible = !suggestionsHidden && (!suggestions.isEmpty() || (menu && value));

    // TODO: convert to functional component and use `useLocale()` hook instead of checking placeholder text.
    if (isRtl(value) || (!value && placeholder && isRtl(placeholder))) {
      style.direction = 'rtl';
    }

    return [
      <div key='input' className='relative w-full'>
        <label className='sr-only'>{placeholder}</label>

        <Input
          type='text'
          className={className}
          outerClassName='mt-0'
          ref={this.setInput}
          disabled={disabled}
          placeholder={placeholder}
          autoFocus={autoFocus}
          value={value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onKeyUp={onKeyUp}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          style={style}
          aria-autocomplete='list'
          id={id}
          maxLength={maxLength}
          data-testid='autosuggest-input'
          theme={theme}
        />
      </div>,
      <Portal key='portal'>
        <div
          style={this.setPortalPosition()}
          className={clsx({
            'fixed w-full z-[1001] shadow bg-white dark:bg-gray-900 rounded-lg py-1 dark:ring-2 dark:ring-primary-700 focus:outline-none': true,
            hidden: !visible,
            block: visible,
          })}
        >
          <div className='space-y-0.5'>
            {suggestions.map(this.renderSuggestion)}
          </div>

          {this.renderMenu()}
        </div>
      </Portal>,
    ];
  }

}
