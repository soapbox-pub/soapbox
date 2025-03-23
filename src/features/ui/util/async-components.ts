import { lazy } from 'react';

export const AboutPage = lazy(() => import('soapbox/features/about/index.tsx'));
export const EmojiPicker = lazy(() => import('soapbox/features/emoji/components/emoji-picker.tsx'));
export const EmojiPickerModal = lazy(() => import('soapbox/features/ui/components/modals/emoji-picker-modal.tsx'));
export const Notifications = lazy(() => import('soapbox/features/notifications/index.tsx'));
export const LandingTimeline = lazy(() => import('soapbox/features/landing-timeline/index.tsx'));
export const HomeTimeline = lazy(() => import('soapbox/features/home-timeline/index.tsx'));
export const PublicTimeline = lazy(() => import('soapbox/features/public-timeline/index.tsx'));
export const RemoteTimeline = lazy(() => import('soapbox/features/remote-timeline/index.tsx'));
export const HashtagTimeline = lazy(() => import('soapbox/features/hashtag-timeline/index.tsx'));
export const DirectTimeline = lazy(() => import('soapbox/features/direct-timeline/index.tsx'));
export const Conversations = lazy(() => import('soapbox/features/conversations/index.tsx'));
export const ListTimeline = lazy(() => import('soapbox/features/list-timeline/index.tsx'));
export const Lists = lazy(() => import('soapbox/features/lists/index.tsx'));
export const Bookmarks = lazy(() => import('soapbox/features/bookmarks/index.tsx'));
export const Status = lazy(() => import('soapbox/features/status/index.tsx'));
export const PinnedStatuses = lazy(() => import('soapbox/features/pinned-statuses/index.tsx'));
export const AccountTimeline = lazy(() => import('soapbox/features/account-timeline/index.tsx'));
export const AccountGallery = lazy(() => import('soapbox/features/account-gallery/index.tsx'));
export const Followers = lazy(() => import('soapbox/features/followers/index.tsx'));
export const Following = lazy(() => import('soapbox/features/following/index.tsx'));
export const FollowRequests = lazy(() => import('soapbox/features/follow-requests/index.tsx'));
export const GenericNotFound = lazy(() => import('soapbox/features/generic-not-found/index.tsx'));
export const FavouritedStatuses = lazy(() => import('soapbox/features/favourited-statuses/index.tsx'));
export const Blocks = lazy(() => import('soapbox/features/blocks/index.tsx'));
export const DomainBlocks = lazy(() => import('soapbox/features/domain-blocks/index.tsx'));
export const Mutes = lazy(() => import('soapbox/features/mutes/index.tsx'));
export const MuteModal = lazy(() => import('soapbox/features/ui/components/modals/mute-modal.tsx'));
export const Filters = lazy(() => import('soapbox/features/filters/index.tsx'));
export const EditFilter = lazy(() => import('soapbox/features/filters/edit-filter.tsx'));
export const ReportModal = lazy(() => import('soapbox/features/ui/components/modals/report-modal/report-modal.tsx'));
export const AccountModerationModal = lazy(() => import('soapbox/features/ui/components/modals/account-moderation-modal/account-moderation-modal.tsx'));
export const MediaGallery = lazy(() => import('soapbox/components/media-gallery.tsx'));
export const Video = lazy(() => import('soapbox/features/video/index.tsx'));
export const Audio = lazy(() => import('soapbox/features/audio/index.tsx'));
export const MediaModal = lazy(() => import('soapbox/features/ui/components/modals/media-modal.tsx'));
export const VideoModal = lazy(() => import('soapbox/features/ui/components/modals/video-modal.tsx'));
export const BoostModal = lazy(() => import('soapbox/features/ui/components/modals/boost-modal.tsx'));
export const ConfirmationModal = lazy(() => import('soapbox/features/ui/components/modals/confirmation-modal.tsx'));
export const MissingDescriptionModal = lazy(() => import('soapbox/features/ui/components/modals/missing-description-modal.tsx'));
export const ActionsModal = lazy(() => import('soapbox/features/ui/components/modals/actions-modal.tsx'));
export const HotkeysModal = lazy(() => import('soapbox/features/ui/components/modals/hotkeys-modal.tsx'));
export const ComposeModal = lazy(() => import('soapbox/features/ui/components/modals/compose-modal.tsx'));
export const ReplyMentionsModal = lazy(() => import('soapbox/features/ui/components/modals/reply-mentions-modal.tsx'));
export const UnauthorizedModal = lazy(() => import('soapbox/features/ui/components/modals/unauthorized-modal.tsx'));
export const EditFederationModal = lazy(() => import('soapbox/features/ui/components/modals/edit-federation-modal.tsx'));
export const EmbedModal = lazy(() => import('soapbox/features/ui/components/modals/embed-modal.tsx'));
export const ComponentModal = lazy(() => import('soapbox/features/ui/components/modals/component-modal.tsx'));
export const ReblogsModal = lazy(() => import('soapbox/features/ui/components/modals/reblogs-modal.tsx'));
export const FavouritesModal = lazy(() => import('soapbox/features/ui/components/modals/favourites-modal.tsx'));
export const DislikesModal = lazy(() => import('soapbox/features/ui/components/modals/dislikes-modal.tsx'));
export const ReactionsModal = lazy(() => import('soapbox/features/ui/components/modals/reactions-modal.tsx'));
export const MentionsModal = lazy(() => import('soapbox/features/ui/components/modals/mentions-modal.tsx'));
export const LandingPageModal = lazy(() => import('soapbox/features/ui/components/modals/landing-page-modal.tsx'));
export const BirthdaysModal = lazy(() => import('soapbox/features/ui/components/modals/birthdays-modal.tsx'));
export const BirthdayPanel = lazy(() => import('soapbox/components/birthday-panel.tsx'));
export const ListEditor = lazy(() => import('soapbox/features/list-editor/index.tsx'));
export const ListAdder = lazy(() => import('soapbox/features/list-adder/index.tsx'));
export const Explore = lazy(() => import('soapbox/features/explore/index.tsx'));
export const LoginPage = lazy(() => import('soapbox/features/auth-login/components/login-page.tsx'));
export const ExternalLogin = lazy(() => import('soapbox/features/external-login/index.tsx'));
export const LogoutPage = lazy(() => import('soapbox/features/auth-login/components/logout.tsx'));
export const RegistrationPage = lazy(() => import('soapbox/features/auth-login/components/registration-page.tsx'));
export const Settings = lazy(() => import('soapbox/features/settings/index.tsx'));
export const EditProfile = lazy(() => import('soapbox/features/edit-profile/index.tsx'));
export const EditEmail = lazy(() => import('soapbox/features/edit-email/index.tsx'));
export const EmailConfirmation = lazy(() => import('soapbox/features/email-confirmation/index.tsx'));
export const EditPassword = lazy(() => import('soapbox/features/edit-password/index.tsx'));
export const DeleteAccount = lazy(() => import('soapbox/features/delete-account/index.tsx'));
export const SoapboxConfig = lazy(() => import('soapbox/features/soapbox-config/index.tsx'));
export const ExportData = lazy(() => import('soapbox/features/export-data/index.tsx'));
export const ImportData = lazy(() => import('soapbox/features/import-data/index.tsx'));
export const Backups = lazy(() => import('soapbox/features/backups/index.tsx'));
export const PasswordReset = lazy(() => import('soapbox/features/auth-login/components/password-reset.tsx'));
export const PasswordResetConfirm = lazy(() => import('soapbox/features/auth-login/components/password-reset-confirm.tsx'));
export const MfaForm = lazy(() => import('soapbox/features/security/mfa-form.tsx'));
export const ChatIndex = lazy(() => import('soapbox/features/chats/index.tsx'));
export const ChatWidget = lazy(() => import('soapbox/features/chats/components/chat-widget/chat-widget.tsx'));
export const ServerInfo = lazy(() => import('soapbox/features/server-info/index.tsx'));
export const Dashboard = lazy(() => import('soapbox/features/admin/index.tsx'));
export const ModerationLog = lazy(() => import('soapbox/features/admin/moderation-log.tsx'));
export const ThemeEditor = lazy(() => import('soapbox/features/theme-editor/index.tsx'));
export const PromoPanel = lazy(() => import('soapbox/features/ui/components/promo-panel.tsx'));
export const SignUpPanel = lazy(() => import('soapbox/features/ui/components/panels/sign-up-panel.tsx'));
export const CtaBanner = lazy(() => import('soapbox/features/ui/components/cta-banner.tsx'));
export const FundingPanel = lazy(() => import('soapbox/features/ui/components/funding-panel.tsx'));
export const TrendsPanel = lazy(() => import('soapbox/features/ui/components/trends-panel.tsx'));
export const ProfileInfoPanel = lazy(() => import('soapbox/features/ui/components/profile-info-panel.tsx'));
export const ProfileMediaPanel = lazy(() => import('soapbox/features/ui/components/profile-media-panel.tsx'));
export const ProfileFieldsPanel = lazy(() => import('soapbox/features/ui/components/profile-fields-panel.tsx'));
export const PinnedAccountsPanel = lazy(() => import('soapbox/features/ui/components/pinned-accounts-panel.tsx'));
export const InstanceInfoPanel = lazy(() => import('soapbox/features/ui/components/instance-info-panel.tsx'));
export const InstanceModerationPanel = lazy(() => import('soapbox/features/ui/components/instance-moderation-panel.tsx'));
export const LatestAdminAccountsPanel = lazy(() => import('soapbox/features/admin/components/latest-accounts-panel.tsx'));
export const SidebarMenu = lazy(() => import('soapbox/components/sidebar-menu.tsx'));
export const ModalContainer = lazy(() => import('soapbox/features/ui/containers/modal-container.ts'));
export const ProfileHoverCard = lazy(() => import('soapbox/components/profile-hover-card.tsx'));
export const StatusHoverCard = lazy(() => import('soapbox/components/status-hover-card.tsx'));
export const CryptoDonate = lazy(() => import('soapbox/features/crypto-donate/index.tsx'));
export const CryptoDonatePanel = lazy(() => import('soapbox/features/crypto-donate/components/crypto-donate-panel.tsx'));
export const CryptoAddress = lazy(() => import('soapbox/features/crypto-donate/components/crypto-address.tsx'));
export const CryptoDonateModal = lazy(() => import('soapbox/features/ui/components/modals/crypto-donate-modal.tsx'));
export const LightningAddress = lazy(() => import('soapbox/features/crypto-donate/components/lightning-address.tsx'));
export const ScheduledStatuses = lazy(() => import('soapbox/features/scheduled-statuses/index.tsx'));
export const UserIndex = lazy(() => import('soapbox/features/admin/user-index.tsx'));
export const FederationRestrictions = lazy(() => import('soapbox/features/federation-restrictions/index.tsx'));
export const Aliases = lazy(() => import('soapbox/features/aliases/index.tsx'));
export const Migration = lazy(() => import('soapbox/features/migration/index.tsx'));
export const WhoToFollowPanel = lazy(() => import('soapbox/features/ui/components/who-to-follow-panel.tsx'));
export const LatestAccountsPanel = lazy(() => import('soapbox/features/ui/components/latest-accounts-panel.tsx'));
export const FollowRecommendations = lazy(() => import('soapbox/features/follow-recommendations/index.tsx'));
export const Directory = lazy(() => import('soapbox/features/directory/index.tsx'));
export const RegisterInvite = lazy(() => import('soapbox/features/register-invite/index.tsx'));
export const Share = lazy(() => import('soapbox/features/share/index.tsx'));
export const NewStatus = lazy(() => import('soapbox/features/new-status/index.tsx'));
export const IntentionalError = lazy(() => import('soapbox/features/intentional-error/index.tsx'));
export const Developers = lazy(() => import('soapbox/features/developers/index.tsx'));
export const CreateApp = lazy(() => import('soapbox/features/developers/apps/create.tsx'));
export const SettingsStore = lazy(() => import('soapbox/features/developers/settings-store.tsx'));
export const TestTimeline = lazy(() => import('soapbox/features/test-timeline/index.tsx'));
export const ServiceWorkerInfo = lazy(() => import('soapbox/features/developers/service-worker-info.tsx'));
export const CompareHistoryModal = lazy(() => import('soapbox/features/ui/components/modals/compare-history-modal.tsx'));
export const AuthTokenList = lazy(() => import('soapbox/features/auth-token-list/index.tsx'));
export const FamiliarFollowersModal = lazy(() => import('soapbox/features/ui/components/modals/familiar-followers-modal.tsx'));
export const AnnouncementsPanel = lazy(() => import('soapbox/components/announcements/announcements-panel.tsx'));
export const Quotes = lazy(() => import('soapbox/features/quotes/index.tsx'));
export const ComposeEventModal = lazy(() => import('soapbox/features/ui/components/modals/compose-event-modal/compose-event-modal.tsx'));
export const JoinEventModal = lazy(() => import('soapbox/features/ui/components/modals/join-event-modal.tsx'));
export const EventHeader = lazy(() => import('soapbox/features/event/components/event-header.tsx'));
export const EventInformation = lazy(() => import('soapbox/features/event/event-information.tsx'));
export const EventDiscussion = lazy(() => import('soapbox/features/event/event-discussion.tsx'));
export const EventMapModal = lazy(() => import('soapbox/features/ui/components/modals/event-map-modal.tsx'));
export const EventParticipantsModal = lazy(() => import('soapbox/features/ui/components/modals/event-participants-modal.tsx'));
export const Events = lazy(() => import('soapbox/features/events/index.tsx'));
export const Groups = lazy(() => import('soapbox/features/groups/index.tsx'));
export const GroupsDiscover = lazy(() => import('soapbox/features/groups/discover.tsx'));
export const GroupsPopular = lazy(() => import('soapbox/features/groups/popular.tsx'));
export const GroupsSuggested = lazy(() => import('soapbox/features/groups/suggested.tsx'));
export const GroupsTag = lazy(() => import('soapbox/features/groups/tag.tsx'));
export const GroupsTags = lazy(() => import('soapbox/features/groups/tags.tsx'));
export const PendingGroupRequests = lazy(() => import('soapbox/features/groups/pending-requests.tsx'));
export const GroupMembers = lazy(() => import('soapbox/features/group/group-members.tsx'));
export const GroupTags = lazy(() => import('soapbox/features/group/group-tags.tsx'));
export const GroupTagTimeline = lazy(() => import('soapbox/features/group/group-tag-timeline.tsx'));
export const GroupTimeline = lazy(() => import('soapbox/features/group/group-timeline.tsx'));
export const ManageGroup = lazy(() => import('soapbox/features/group/manage-group.tsx'));
export const EditGroup = lazy(() => import('soapbox/features/group/edit-group.tsx'));
export const GroupBlockedMembers = lazy(() => import('soapbox/features/group/group-blocked-members.tsx'));
export const GroupMembershipRequests = lazy(() => import('soapbox/features/group/group-membership-requests.tsx'));
export const GroupGallery = lazy(() => import('soapbox/features/group/group-gallery.tsx'));
export const CreateGroupModal = lazy(() => import('soapbox/features/ui/components/modals/manage-group-modal/create-group-modal.tsx'));
export const NewGroupPanel = lazy(() => import('soapbox/features/ui/components/panels/new-group-panel.tsx'));
export const MyGroupsPanel = lazy(() => import('soapbox/features/ui/components/panels/my-groups-panel.tsx'));
export const SuggestedGroupsPanel = lazy(() => import('soapbox/features/ui/components/panels/suggested-groups-panel.tsx'));
export const GroupMediaPanel = lazy(() => import('soapbox/features/ui/components/group-media-panel.tsx'));
export const NewEventPanel = lazy(() => import('soapbox/features/ui/components/panels/new-event-panel.tsx'));
export const Announcements = lazy(() => import('soapbox/features/admin/announcements.tsx'));
export const EditAnnouncementModal = lazy(() => import('soapbox/features/ui/components/modals/edit-announcement-modal.tsx'));
export const FollowedTags = lazy(() => import('soapbox/features/followed-tags/index.tsx'));
export const AccountNotePanel = lazy(() => import('soapbox/features/ui/components/panels/account-note-panel.tsx'));
export const ComposeEditor = lazy(() => import('soapbox/features/compose/editor/index.tsx'));
export const OnboardingModal = lazy(() => import('soapbox/features/ui/components/modals/onboarding-flow-modal/onboarding-modal.tsx'));
export const NostrSignupModal = lazy(() => import('soapbox/features/ui/components/modals/nostr-signup-modal/nostr-signup-modal.tsx'));
export const NostrLoginModal = lazy(() => import('soapbox/features/ui/components/modals/nostr-login-modal/nostr-login-modal.tsx'));
export const EditIdentity = lazy(() => import('soapbox/features/edit-identity/index.tsx'));
export const Domains = lazy(() => import('soapbox/features/admin/domains.tsx'));
export const EditDomainModal = lazy(() => import('soapbox/features/ui/components/modals/edit-domain-modal.tsx'));
export const NostrRelays = lazy(() => import('soapbox/features/nostr-relays/index.tsx'));
export const Bech32Redirect = lazy(() => import('soapbox/features/nostr/Bech32Redirect.tsx'));
export const ManageZapSplit = lazy(() => import('soapbox/features/admin/manage-zap-split.tsx'));
export const ManageDittoServer = lazy(() => import('soapbox/features/admin/manage-ditto-server.tsx'));
export const Relays = lazy(() => import('soapbox/features/admin/relays.tsx'));
export const Rules = lazy(() => import('soapbox/features/admin/rules.tsx'));
export const EditRuleModal = lazy(() => import('soapbox/features/ui/components/modals/edit-rule-modal.tsx'));
export const AdminNostrRelays = lazy(() => import('soapbox/features/admin/nostr-relays.tsx'));
export const PayRequestModal = lazy(() => import('soapbox/features/ui/components/modals/pay-request-modal.tsx'));
export const ZapInvoiceModal = lazy(() => import('soapbox/features/ui/components/modals/zap-invoice.tsx'));
export const ZapsModal = lazy(() => import('soapbox/features/ui/components/modals/zaps-modal.tsx'));
export const ZapSplitModal = lazy(() => import('soapbox/features/ui/components/modals/zap-split/zap-split-modal.tsx'));
export const CaptchaModal = lazy(() => import('soapbox/features/ui/components/modals/captcha-modal/captcha-modal.tsx'));
export const NostrBunkerLogin = lazy(() => import('soapbox/features/nostr/nostr-bunker-login.tsx'));
export const Wallet = lazy(() => import('soapbox/features/wallet/index.tsx'));
export const WalletRelays = lazy(() => import('soapbox/features/wallet/components/wallet-relays.tsx'));
export const WalletMints = lazy(() => import('soapbox/features/wallet/components/wallet-mints.tsx'));
export const WalletTransactions = lazy(() => import('soapbox/features/wallet/components/wallet-transactions.tsx'));
export const StreakModal = lazy(() => import('soapbox/features/ui/components/modals/streak-modal.tsx'));
export const FollowsTimeline = lazy(() => import('soapbox/features/home-timeline/follows-timeline.tsx'));
export const CommunityTimeline = lazy(() => import('soapbox/features/home-timeline/community-timeline.tsx'));