import EmojiData from '@emoji-mart/data';
import classNames from 'classnames';
import { supportsPassiveEvents } from 'detect-passive-events';
import { Picker } from 'emoji-mart';
import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { defineMessages, injectIntl } from 'react-intl';
import Overlay from 'react-overlays/lib/Overlay';

import { IconButton } from 'soapbox/components/ui';

import { buildCustomEmojis } from '../../emoji/emoji';
// import { EmojiPicker as EmojiPickerAsync } from '../../ui/util/async-components';

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  emoji_search: { id: 'emoji_button.search', defaultMessage: 'Search…' },
  emoji_not_found: { id: 'emoji_button.not_found', defaultMessage: 'No emoji\'s found.' },
  custom: { id: 'emoji_button.custom', defaultMessage: 'Custom' },
  recent: { id: 'emoji_button.recent', defaultMessage: 'Frequently used' },
  search_results: { id: 'emoji_button.search_results', defaultMessage: 'Search results' },
  people: { id: 'emoji_button.people', defaultMessage: 'People' },
  nature: { id: 'emoji_button.nature', defaultMessage: 'Nature' },
  food: { id: 'emoji_button.food', defaultMessage: 'Food & Drink' },
  activity: { id: 'emoji_button.activity', defaultMessage: 'Activity' },
  travel: { id: 'emoji_button.travel', defaultMessage: 'Travel & Places' },
  objects: { id: 'emoji_button.objects', defaultMessage: 'Objects' },
  symbols: { id: 'emoji_button.symbols', defaultMessage: 'Symbols' },
  flags: { id: 'emoji_button.flags', defaultMessage: 'Flags' },
});

// const categories = [
//   'recent',
//   'custom',
//   'people',
//   'nature',
//   'foods',
//   'activity',
//   'places',
//   'objects',
//   'symbols',
//   'flags',
// ];

function EmojiPicker(props) {
  const ref = useRef();

  useEffect(() => {
    const input = { ...props, data: EmojiData, ref };

    new Picker(input);
  }, []);

  return <div ref={ref} />;
}
// let EmojiPicker, Emoji; // load asynchronously

// const backgroundImageFn = () => require('emoji-datasource/img/twitter/sheets/32.png');
const listenerOptions = supportsPassiveEvents ? { passive: true } : false;


@injectIntl
class EmojiPickerMenu extends React.PureComponent {

  static propTypes = {
    custom_emojis: ImmutablePropTypes.list,
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.string),
    loading: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onPick: PropTypes.func.isRequired,
    style: PropTypes.object,
    placement: PropTypes.string,
    arrowOffsetLeft: PropTypes.string,
    arrowOffsetTop: PropTypes.string,
    intl: PropTypes.object.isRequired,
    skinTone: PropTypes.number.isRequired,
    onSkinTone: PropTypes.func.isRequired,
  };

  static defaultProps = {
    style: {},
    loading: true,
    frequentlyUsedEmojis: [],
  };

  state = {
    modifierOpen: false,
    placement: null,
  };

  handleDocumentClick = e => {
    if (this.node && !this.node.contains(e.target)) {
      this.props.onClose();
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick, false);
    document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick, false);
    document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  setRef = c => {
    this.node = c;
  }

  getI18n = () => {
    const { intl } = this.props;

    return {
      search: intl.formatMessage(messages.emoji_search),
      notfound: intl.formatMessage(messages.emoji_not_found),
      categories: {
        search: intl.formatMessage(messages.search_results),
        recent: intl.formatMessage(messages.recent),
        people: intl.formatMessage(messages.people),
        nature: intl.formatMessage(messages.nature),
        foods: intl.formatMessage(messages.food),
        activity: intl.formatMessage(messages.activity),
        places: intl.formatMessage(messages.travel),
        objects: intl.formatMessage(messages.objects),
        symbols: intl.formatMessage(messages.symbols),
        flags: intl.formatMessage(messages.flags),
        custom: intl.formatMessage(messages.custom),
      },
    };
  }

  handleClick = emoji => {
    console.log(emoji);

    if (!emoji.native) {
      emoji.native = emoji.colons;
    }

    this.props.onClose();
    this.props.onPick(emoji);
  }

  handleModifierOpen = () => {
    this.setState({ modifierOpen: true });
  }

  handleModifierClose = () => {
    this.setState({ modifierOpen: false });
  }

  handleModifierChange = modifier => {
    this.props.onSkinTone(modifier);
  }

  render() {
    const { loading, style, intl, custom_emojis, skinTone, frequentlyUsedEmojis } = this.props;

    if (loading) {
      return <div style={{ width: 299 }} />;
    }

    const title = intl.formatMessage(messages.emoji);
    const { modifierOpen } = this.state;

    return (
      <div className={classNames('emoji-picker-dropdown__menu', { selecting: modifierOpen })} style={style} ref={this.setRef}>
        <EmojiPicker
          custom={[{ emojis: buildCustomEmojis(custom_emojis) }]}
          title={title}
          onEmojiSelect={this.handleClick}
          recent={frequentlyUsedEmojis}
          skin={skinTone}
        />
      </div>
    );
  }

}

export default @injectIntl
class EmojiPickerDropdown extends React.PureComponent {

  static propTypes = {
    custom_emojis: ImmutablePropTypes.list,
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.string),
    intl: PropTypes.object.isRequired,
    onPickEmoji: PropTypes.func.isRequired,
    onSkinTone: PropTypes.func.isRequired,
    skinTone: PropTypes.number.isRequired,
  };

  state = {
    active: false,
    loading: false,
  };

  setRef = (c) => {
    this.dropdown = c;
  }

  onShowDropdown = (e) => {
    e.stopPropagation();

    this.setState({ active: true });

    // if (!EmojiPicker) {
    //   this.setState({ loading: true });
    //
    //   EmojiPickerAsync().then(EmojiMart => {
    //     EmojiPicker = EmojiMart.Picker;
    //     Emoji       = EmojiMart.Emoji;
    //
    //     this.setState({ loading: false });
    //   }).catch(() => {
    //     this.setState({ loading: false });
    //   });
    // }

    const { top } = e.target.getBoundingClientRect();
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
    const { intl, onPickEmoji, onSkinTone, skinTone, frequentlyUsedEmojis } = this.props;
    const title = intl.formatMessage(messages.emoji);
    const { active, loading, placement } = this.state;

    return (
      <div className='relative' onKeyDown={this.handleKeyDown}>
        <IconButton
          ref={this.setTargetRef}
          className={classNames({
            'text-gray-400 hover:text-gray-600': true,
            'pulse-loading': active && loading,
          })}
          alt='😀'
          src={require('@tabler/icons/icons/mood-happy.svg')}
          title={title}
          aria-label={title}
          aria-expanded={active}
          role='button'
          onClick={this.onToggle}
          onKeyDown={this.onToggle}
          tabIndex={0}
        />

        <Overlay show={active} placement={placement} target={this.findTarget}>
          <EmojiPickerMenu
            custom_emojis={this.props.custom_emojis}
            loading={loading}
            onClose={this.onHideDropdown}
            onPick={onPickEmoji}
            onSkinTone={onSkinTone}
            skinTone={skinTone}
            frequentlyUsedEmojis={frequentlyUsedEmojis}
          />
        </Overlay>
      </div>
    );
  }

}
