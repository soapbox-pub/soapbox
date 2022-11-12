import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Overlay from 'react-overlays/lib/Overlay';

import Icon from 'soapbox/components/icon';

import IconPickerMenu from './icon-picker-menu';

const messages = defineMessages({
  emoji: { id: 'icon_button.label', defaultMessage: 'Select icon' },
});

class IconPickerDropdown extends React.PureComponent {

  static propTypes = {
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.string),
    intl: PropTypes.object.isRequired,
    onPickEmoji: PropTypes.func.isRequired,
    value: PropTypes.string,
  };

  state = {
    active: false,
    loading: false,
  };

  setRef = (c) => {
    this.dropdown = c;
  }

  onShowDropdown = ({ target }) => {
    this.setState({ active: true });

    const { top } = target.getBoundingClientRect();
    this.setState({ placement: top * 2 < innerHeight ? 'bottom' : 'top' });
  }

  onHideDropdown = () => {
    this.setState({ active: false });
  }

  onToggle = (e) => {
    if (!this.state.loading && (!e.key || e.key === 'Enter')) {
      if (this.state.active) {
        this.onHideDropdown();
      } else {
        this.onShowDropdown(e);
      }
    }
  }

  handleKeyDown = e => {
    if (e.key === 'Escape') {
      this.onHideDropdown();
    }
  }

  setTargetRef = c => {
    this.target = c;
  }

  findTarget = () => {
    return this.target;
  }

  render() {
    const { intl, onPickEmoji, value } = this.props;
    const title = intl.formatMessage(messages.emoji);
    const { active, loading, placement } = this.state;
    const forkAwesomeIcons = require('../forkawesome.json');

    return (
      <div onKeyDown={this.handleKeyDown}>
        <div
          ref={this.setTargetRef}
          className='h-[38px] w-[38px] text-lg flex items-center justify-center cursor-pointer'
          title={title}
          aria-label={title}
          aria-expanded={active}
          role='button'
          onClick={this.onToggle}
          onKeyDown={this.onToggle}
          tabIndex={0}
        >
          <Icon id={value} />
        </div>

        <Overlay show={active} placement={placement} target={this.findTarget}>
          <IconPickerMenu
            custom_emojis={forkAwesomeIcons}
            loading={loading}
            onClose={this.onHideDropdown}
            onPick={onPickEmoji}
          />
        </Overlay>
      </div>
    );
  }

}

export default injectIntl(IconPickerDropdown);