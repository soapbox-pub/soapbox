import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import { defineMessages, injectIntl } from 'react-intl';

import AutosuggestAccountInput from 'soapbox/components/autosuggest_account_input';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  action: { id: 'search.action', defaultMessage: 'Search for “{query}”' },
});

export default @injectIntl
class Search extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    value: PropTypes.string.isRequired,
    submitted: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onShow: PropTypes.func.isRequired,
    onSelected: PropTypes.func,
    openInRoute: PropTypes.bool,
    autoFocus: PropTypes.bool,
    autosuggest: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = {
    autoFocus: false,
    ausosuggest: false,
  }

  state = {
    expanded: false,
  };

  handleChange = (e) => {
    this.props.onChange(e.target.value);
  }

  handleClear = (e) => {
    e.preventDefault();

    if (this.props.value.length > 0 || this.props.submitted) {
      this.props.onClear();
    }
  }

  handleSubmit = () => {
    this.props.onSubmit();

    if (this.props.openInRoute) {
      this.context.router.history.push('/search');
    }
  }

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleSubmit();
    } else if (e.key === 'Escape') {
      document.querySelector('.ui').parentElement.focus();
    }
  }

  handleFocus = () => {
    this.setState({ expanded: true });
    this.props.onShow();
  }

  handleBlur = () => {
    this.setState({ expanded: false });
  }

  handleSelected = accountId => {
    const { onSelected } = this.props;

    if (onSelected) {
      onSelected(accountId, this.context.router.history);
    }
  }

  makeMenu = () => {
    const { intl, value } = this.props;

    return [
      { text: intl.formatMessage(messages.action, { query: value }), icon: require('@tabler/icons/icons/search.svg'), action: this.handleSubmit },
    ];
  }

  render() {
    const { intl, value, autoFocus, autosuggest, submitted } = this.props;
    const hasValue = value.length > 0 || submitted;

    const Component = autosuggest ? AutosuggestAccountInput : 'input';

    return (
      <div className='w-full'>
        <label htmlFor='search' className='sr-only'>{intl.formatMessage(messages.placeholder)}</label>

        <div className='relative'>
          <Component
            className='block w-full pl-3 pr-10 py-2 border border-gray-100 rounded-full leading-5 bg-gray-100 placeholder-gray-500 focus:bg-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
            type='text'
            id='search'
            placeholder={intl.formatMessage(messages.placeholder)}
            value={value}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onSelected={this.handleSelected}
            autoFocus={autoFocus}
            autoSelect={false}
            menu={this.makeMenu()}
          />

          <div role='button' tabIndex='0' className='absolute inset-y-0 right-0 px-3 flex items-center cursor-pointer' onClick={this.handleClear}>
            <InlineSVG src={require('@tabler/icons/icons/search.svg')} className={classNames('h-4 w-4 text-gray-400', { hidden: hasValue })} />
            <InlineSVG src={require('@tabler/icons/icons/x.svg')} className={classNames('h-4 w-4 text-gray-400', { hidden: !hasValue })} aria-label={intl.formatMessage(messages.placeholder)} />
          </div>
        </div>
      </div>
    );
  }

}
