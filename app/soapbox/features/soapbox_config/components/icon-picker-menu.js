import classNames from 'clsx';
import { supportsPassiveEvents } from 'detect-passive-events';
import Picker from 'emoji-mart/dist-es/components/picker/picker';
import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  emoji: { id: 'icon_button.label', defaultMessage: 'Select icon' },
  emoji_search: { id: 'emoji_button.search', defaultMessage: 'Search…' },
  emoji_not_found: { id: 'icon_button.not_found', defaultMessage: 'No icons!! (╯°□°）╯︵ ┻━┻' },
  custom: { id: 'icon_button.icons', defaultMessage: 'Icons' },
  search_results: { id: 'emoji_button.search_results', defaultMessage: 'Search results' },
});

const backgroundImageFn = () => '';
const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

const categoriesSort = ['custom'];


class IconPickerMenu extends React.PureComponent {

  static propTypes = {
    custom_emojis: PropTypes.object,
    loading: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onPick: PropTypes.func.isRequired,
    style: PropTypes.object,
    placement: PropTypes.string,
    arrowOffsetLeft: PropTypes.string,
    arrowOffsetTop: PropTypes.string,
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = {
    style: {},
    loading: true,
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

    if (!c) return;

    // Nice and dirty hack to display the icons
    c.querySelectorAll('button.emoji-mart-emoji > img').forEach(elem => {
      const newIcon = document.createElement('span');
      newIcon.innerHTML = `<i class="fa fa-${elem.parentNode.getAttribute('title')} fa-hack"></i>`;
      elem.parentNode.replaceChild(newIcon, elem);
    });
  }

  getI18n = () => {
    const { intl } = this.props;

    return {
      search: intl.formatMessage(messages.emoji_search),
      notfound: intl.formatMessage(messages.emoji_not_found),
      categories: {
        search: intl.formatMessage(messages.search_results),
        custom: intl.formatMessage(messages.custom),
      },
    };
  }

  handleClick = emoji => {
    emoji.native = emoji.colons;

    this.props.onClose();
    this.props.onPick(emoji);
  }

  buildIcons = (customEmojis, autoplay = false) => {
    const emojis = [];

    Object.values(customEmojis).forEach(category => {
      category.forEach(function(icon) {
        const name = icon.replace('fa fa-', '');
        if (icon !== 'email' && icon !== 'memo') {
          emojis.push({
            id: name,
            name,
            short_names: [name],
            emoticons: [],
            keywords: [name],
            imageUrl: '',
          });
        }
      });
    });

    return emojis;
  };

  render() {
    const { loading, style, intl, custom_emojis } = this.props;

    if (loading) {
      return <div style={{ width: 299 }} />;
    }

    const data = { compressed: true, categories: [], aliases: [], emojis: [] };
    const title = intl.formatMessage(messages.emoji);
    const { modifierOpen } = this.state;

    return (
      <div className={classNames('font-icon-picker emoji-picker-dropdown__menu', { selecting: modifierOpen })} style={style} ref={this.setRef}>
        <Picker
          perLine={8}
          emojiSize={22}
          include={categoriesSort}
          sheetSize={32}
          custom={this.buildIcons(custom_emojis)}
          color=''
          emoji=''
          set=''
          title={title}
          i18n={this.getI18n()}
          onClick={this.handleClick}
          showPreview={false}
          backgroundImageFn={backgroundImageFn}
          emojiTooltip
          noShowAnchors
          data={data}
        />
      </div>
    );
  }

}

export default injectIntl(IconPickerMenu);
