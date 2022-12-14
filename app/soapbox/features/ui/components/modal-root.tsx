import React from 'react';

import Base from 'soapbox/components/modal-root';
import {
  MediaModal,
  VideoModal,
  BoostModal,
  ConfirmationModal,
  MuteModal,
  ReportModal,
  EmbedModal,
  CryptoDonateModal,
  ListEditor,
  ListAdder,
  MissingDescriptionModal,
  ActionsModal,
  HotkeysModal,
  ComposeModal,
  ReplyMentionsModal,
  UnauthorizedModal,
  EditFederationModal,
  ComponentModal,
  ReactionsModal,
  FavouritesModal,
  ReblogsModal,
  MentionsModal,
  LandingPageModal,
  BirthdaysModal,
  AccountNoteModal,
  CompareHistoryModal,
  VerifySmsModal,
  FamiliarFollowersModal,
  ComposeEventModal,
  JoinEventModal,
  AccountModerationModal,
  EventMapModal,
  EventParticipantsModal,
  PolicyModal,
  ManageGroupModal,
} from 'soapbox/features/ui/util/async-components';

import BundleContainer from '../containers/bundle-container';

import { BundleProps } from './bundle';
import BundleModalError from './bundle-modal-error';
import ModalLoading from './modal-loading';

const MODAL_COMPONENTS = {
  'MEDIA': MediaModal,
  'VIDEO': VideoModal,
  'BOOST': BoostModal,
  'CONFIRM': ConfirmationModal,
  'MISSING_DESCRIPTION': MissingDescriptionModal,
  'MUTE': MuteModal,
  'REPORT': ReportModal,
  'ACTIONS': ActionsModal,
  'EMBED': EmbedModal,
  'LIST_EDITOR': ListEditor,
  'LIST_ADDER': ListAdder,
  'HOTKEYS': HotkeysModal,
  'COMPOSE': ComposeModal,
  'REPLY_MENTIONS': ReplyMentionsModal,
  'UNAUTHORIZED': UnauthorizedModal,
  'CRYPTO_DONATE': CryptoDonateModal,
  'EDIT_FEDERATION': EditFederationModal,
  'COMPONENT': ComponentModal,
  'REBLOGS': ReblogsModal,
  'FAVOURITES': FavouritesModal,
  'REACTIONS': ReactionsModal,
  'MENTIONS': MentionsModal,
  'LANDING_PAGE': LandingPageModal,
  'BIRTHDAYS': BirthdaysModal,
  'ACCOUNT_NOTE': AccountNoteModal,
  'COMPARE_HISTORY': CompareHistoryModal,
  'VERIFY_SMS': VerifySmsModal,
  'FAMILIAR_FOLLOWERS': FamiliarFollowersModal,
  'COMPOSE_EVENT': ComposeEventModal,
  'JOIN_EVENT': JoinEventModal,
  'ACCOUNT_MODERATION': AccountModerationModal,
  'EVENT_MAP': EventMapModal,
  'EVENT_PARTICIPANTS': EventParticipantsModal,
  'POLICY': PolicyModal,
  'MANAGE_GROUP': ManageGroupModal,
};

export type ModalType = keyof typeof MODAL_COMPONENTS | null;

interface IModalRoot {
  type: ModalType,
  props?: Record<string, any> | null,
  onClose: (type?: ModalType) => void,
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
  }

  renderError: React.ComponentType<{ onRetry: (props?: BundleProps) => void }> = (props) => {
    return <BundleModalError {...props} onClose={this.onClickClose} />;
  }

  onClickClose = (_?: ModalType) => {
    const { onClose, type } = this.props;
    onClose(type);
  }

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
