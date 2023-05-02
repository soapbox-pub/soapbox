import React from 'react';

import Base from 'soapbox/components/modal-root';
import {
  AccountModerationModal,
  AccountNoteModal,
  ActionsModal,
  BirthdaysModal,
  BoostModal,
  CompareHistoryModal,
  ComponentModal,
  ComposeEventModal,
  ComposeModal,
  ConfirmationModal,
  CryptoDonateModal,
  DislikesModal,
  EditAnnouncementModal,
  EditFederationModal,
  EmbedModal,
  EventMapModal,
  EventParticipantsModal,
  FamiliarFollowersModal,
  FavouritesModal,
  HotkeysModal,
  JoinEventModal,
  LandingPageModal,
  ListAdder,
  ListEditor,
  CreateGroupModal,
  MediaModal,
  MentionsModal,
  MissingDescriptionModal,
  MuteModal,
  PolicyModal,
  ReactionsModal,
  ReblogsModal,
  ReplyMentionsModal,
  ReportModal,
  UnauthorizedModal,
  VerifySmsModal,
  VideoModal,
} from 'soapbox/features/ui/util/async-components';

import BundleContainer from '../containers/bundle-container';

import { BundleProps } from './bundle';
import BundleModalError from './bundle-modal-error';
import ModalLoading from './modal-loading';

/* eslint sort-keys: "error" */
const MODAL_COMPONENTS = {
  'ACCOUNT_MODERATION': AccountModerationModal,
  'ACCOUNT_NOTE': AccountNoteModal,
  'ACTIONS': ActionsModal,
  'BIRTHDAYS': BirthdaysModal,
  'BOOST': BoostModal,
  'COMPARE_HISTORY': CompareHistoryModal,
  'COMPONENT': ComponentModal,
  'COMPOSE': ComposeModal,
  'COMPOSE_EVENT': ComposeEventModal,
  'CONFIRM': ConfirmationModal,
  'CREATE_GROUP': CreateGroupModal,
  'CRYPTO_DONATE': CryptoDonateModal,
  'DISLIKES': DislikesModal,
  'EDIT_ANNOUNCEMENT': EditAnnouncementModal,
  'EDIT_FEDERATION': EditFederationModal,
  'EMBED': EmbedModal,
  'EVENT_MAP': EventMapModal,
  'EVENT_PARTICIPANTS': EventParticipantsModal,
  'FAMILIAR_FOLLOWERS': FamiliarFollowersModal,
  'FAVOURITES': FavouritesModal,
  'HOTKEYS': HotkeysModal,
  'JOIN_EVENT': JoinEventModal,
  'LANDING_PAGE': LandingPageModal,
  'LIST_ADDER': ListAdder,
  'LIST_EDITOR': ListEditor,
  'MEDIA': MediaModal,
  'MENTIONS': MentionsModal,
  'MISSING_DESCRIPTION': MissingDescriptionModal,
  'MUTE': MuteModal,
  'POLICY': PolicyModal,
  'REACTIONS': ReactionsModal,
  'REBLOGS': ReblogsModal,
  'REPLY_MENTIONS': ReplyMentionsModal,
  'REPORT': ReportModal,
  'UNAUTHORIZED': UnauthorizedModal,
  'VERIFY_SMS': VerifySmsModal,
  'VIDEO': VideoModal,
};

export type ModalType = keyof typeof MODAL_COMPONENTS | null;

interface IModalRoot {
  type: ModalType
  props?: Record<string, any> | null
  onClose: (type?: ModalType) => void
}

export default class ModalRoot extends React.PureComponent<IModalRoot> {

  getSnapshotBeforeUpdate() {
    return { visible: !!this.props.type };
  }

  componentDidUpdate(prevProps: IModalRoot, prevState: any, { visible }: any) {
    if (visible) {
      document.body.classList.add('with-modals');
    } else {
      document.body.classList.remove('with-modals');
    }
  }

  renderLoading = (modalId: string) => () => {
    return !['MEDIA', 'VIDEO', 'BOOST', 'CONFIRM', 'ACTIONS'].includes(modalId) ? <ModalLoading /> : null;
  };

  renderError: React.ComponentType<{ onRetry: (props?: BundleProps) => void }> = (props) => {
    return <BundleModalError {...props} onClose={this.onClickClose} />;
  };

  onClickClose = (_?: ModalType) => {
    const { onClose, type } = this.props;
    onClose(type);
  };

  render() {
    const { type, props } = this.props;
    const visible = !!type;

    return (
      <Base onClose={this.onClickClose} type={type}>
        {visible && (
          <BundleContainer fetchComponent={MODAL_COMPONENTS[type]} loading={this.renderLoading(type)} error={this.renderError} renderDelay={200}>
            {(SpecificComponent) => <SpecificComponent {...props} onClose={this.onClickClose} />}
          </BundleContainer>
        )}
      </Base>
    );
  }

}
