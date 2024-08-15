import React, { Suspense } from 'react';

import Base from 'soapbox/components/modal-root';
import {
  AccountModerationModal,
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
  EditBookmarkFolderModal,
  EditDomainModal,
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
  NostrLoginModal,
  NostrSignupModal,
  OnboardingFlowModal,
  ReactionsModal,
  ReblogsModal,
  ReplyMentionsModal,
  ReportModal,
  SelectBookmarkFolderModal,
  UnauthorizedModal,
  VideoModal,
  EditRuleModal,
  ZapPayRequestModal,
  ZapInvoiceModal,
  ZapsModal,
} from 'soapbox/features/ui/util/async-components';

import ModalLoading from './modal-loading';

/* eslint sort-keys: "error" */
const MODAL_COMPONENTS: Record<string, React.LazyExoticComponent<any>> = {
  'ACCOUNT_MODERATION': AccountModerationModal,
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
  'EDIT_BOOKMARK_FOLDER': EditBookmarkFolderModal,
  'EDIT_DOMAIN': EditDomainModal,
  'EDIT_FEDERATION': EditFederationModal,
  'EDIT_RULE': EditRuleModal,
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
  'NOSTR_LOGIN': NostrLoginModal,
  'NOSTR_SIGNUP': NostrSignupModal,
  'ONBOARDING_FLOW': OnboardingFlowModal,
  'REACTIONS': ReactionsModal,
  'REBLOGS': ReblogsModal,
  'REPLY_MENTIONS': ReplyMentionsModal,
  'REPORT': ReportModal,
  'SELECT_BOOKMARK_FOLDER': SelectBookmarkFolderModal,
  'UNAUTHORIZED': UnauthorizedModal,
  'VIDEO': VideoModal,
  'ZAPS': ZapsModal,
  'ZAP_INVOICE': ZapInvoiceModal,
  'ZAP_PAY_REQUEST': ZapPayRequestModal,
};

export type ModalType = keyof typeof MODAL_COMPONENTS | null;

interface IModalRoot {
  type: ModalType;
  props?: Record<string, any> | null;
  onClose: (type?: ModalType) => void;
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

  renderLoading = (modalId: string) => {
    return !['MEDIA', 'VIDEO', 'BOOST', 'CONFIRM', 'ACTIONS'].includes(modalId) ? <ModalLoading /> : null;
  };

  onClickClose = (_?: ModalType) => {
    const { onClose, type } = this.props;
    onClose(type);
  };

  render() {
    const { type, props } = this.props;
    const Component = type ? MODAL_COMPONENTS[type] : null;

    return (
      <Base onClose={this.onClickClose} type={type}>
        {(Component && !!type) && (
          <Suspense fallback={this.renderLoading(type)}>
            <Component {...props} onClose={this.onClickClose} />
          </Suspense>
        )}
      </Base>
    );
  }

}
