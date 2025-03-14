import { PureComponent, Suspense } from 'react';

import Base from 'soapbox/components/modal-root.tsx';
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
  EditDomainModal,
  EditFederationModal,
  EmbedModal,
  EmojiPickerModal,
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
  OnboardingModal,
  ReactionsModal,
  ReblogsModal,
  ReplyMentionsModal,
  ReportModal,
  StreakModal,
  UnauthorizedModal,
  VideoModal,
  EditRuleModal,
  PayRequestModal,
  ZapSplitModal,
  ZapInvoiceModal,
  ZapsModal,
  CaptchaModal,
} from 'soapbox/features/ui/util/async-components.ts';

import ModalLoading from './modal-loading.tsx';

/* eslint sort-keys: "error" */
const MODAL_COMPONENTS: Record<string, React.ExoticComponent<any>> = {
  'ACCOUNT_MODERATION': AccountModerationModal,
  'ACTIONS': ActionsModal,
  'BIRTHDAYS': BirthdaysModal,
  'BOOST': BoostModal,
  'CAPTCHA': CaptchaModal,
  'COMPARE_HISTORY': CompareHistoryModal,
  'COMPONENT': ComponentModal,
  'COMPOSE': ComposeModal,
  'COMPOSE_EVENT': ComposeEventModal,
  'CONFIRM': ConfirmationModal,
  'CREATE_GROUP': CreateGroupModal,
  'CRYPTO_DONATE': CryptoDonateModal,
  'DISLIKES': DislikesModal,
  'EDIT_ANNOUNCEMENT': EditAnnouncementModal,
  'EDIT_DOMAIN': EditDomainModal,
  'EDIT_FEDERATION': EditFederationModal,
  'EDIT_RULE': EditRuleModal,
  'EMBED': EmbedModal,
  'EMOJI_PICKER': EmojiPickerModal,
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
  'ONBOARDING': OnboardingModal,
  'PAY_REQUEST': PayRequestModal,
  'REACTIONS': ReactionsModal,
  'REBLOGS': ReblogsModal,
  'REPLY_MENTIONS': ReplyMentionsModal,
  'REPORT': ReportModal,
  'STREAK': StreakModal,
  'UNAUTHORIZED': UnauthorizedModal,
  'VIDEO': VideoModal,
  'ZAPS': ZapsModal,
  'ZAP_INVOICE': ZapInvoiceModal,
  'ZAP_SPLIT': ZapSplitModal,
};

export type ModalType = keyof typeof MODAL_COMPONENTS | null;

interface IModalRoot {
  type: ModalType;
  props?: Record<string, any> | null;
  onClose: (type?: ModalType) => void;
}

export default class ModalRoot extends PureComponent<IModalRoot> {

  getSnapshotBeforeUpdate() {
    return { visible: !!this.props.type };
  }

  componentDidUpdate(prevProps: IModalRoot, prevState: any, { visible }: any) {
    if (visible) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
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
