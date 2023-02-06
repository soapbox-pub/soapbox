import React from 'react';
import { HotKeys } from 'react-hotkeys';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { getSoapboxConfig } from 'soapbox/actions/soapbox';
import { EmojiSelector as RealEmojiSelector } from 'soapbox/components/ui';

import type { List as ImmutableList } from 'immutable';
import type { RootState } from 'soapbox/store';

const mapStateToProps = (state: RootState) => ({
  allowedEmoji: getSoapboxConfig(state).allowedEmoji,
});

interface IEmojiSelector {
  allowedEmoji: ImmutableList<string>,
  onReact: (emoji: string) => void,
  onUnfocus: () => void,
  visible: boolean,
  focused?: boolean,
}

class EmojiSelector extends ImmutablePureComponent<IEmojiSelector> {

  static defaultProps: Partial<IEmojiSelector> = {
    onReact: () => { },
    onUnfocus: () => { },
    visible: false,
  };

  handlers = {
    open: () => { },
  };

  render() {
    const { visible, focused, allowedEmoji, onReact, onUnfocus } = this.props;

    return (
      <HotKeys handlers={this.handlers}>
        <RealEmojiSelector
          emojis={allowedEmoji.toArray()}
          onReact={onReact}
          visible={visible}
          focused={focused}
          onUnfocus={onUnfocus}
        />
      </HotKeys>
    );
  }

}

export default connect(mapStateToProps)(EmojiSelector);
