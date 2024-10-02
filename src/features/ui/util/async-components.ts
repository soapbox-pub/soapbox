import { lazy } from 'react';

export const AboutPage = lazy(() => import('soapbox/features/about'));
export const EmojiPicker = lazy(() => import('soapbox/features/emoji/components/emoji-picker'));
export const Notifications = lazy(() => import('soapbox/features/notifications'));
export const LandingTimeline = lazy(() => import('soapbox/features/landing-timeline'));
export const HomeTimeline = lazy(() => import('soapbox/features/home-timeline'));
export const PublicTimeline = lazy(() => import('soapbox/features/public-timeline'));
export const RemoteTimeline = lazy(() => import('soapbox/features/remote-timeline'));
export const CommunityTimeline = lazy(() => import('soapbox/features/community-timeline'));
export const HashtagTimeline = lazy(() => import('soapbox/features/hashtag-timeline'));
export const DirectTimeline = lazy(() => import('soapbox/features/direct-timeline'));
export const Conversations = lazy(() => import('soapbox/features/conversations'));
export const ListTimeline = lazy(() => import('soapbox/features/list-timeline'));
export const Lists = lazy(() => import('soapbox/features/lists'));
export const Bookmarks = lazy(() => import('soapbox/features/bookmarks'));
export const Status = lazy(() => import('soapbox/features/status'));
export const PinnedStatuses = lazy(() => import('soapbox/features/pinned-statuses'));
export const AccountTimeline = lazy(() => import('soapbox/features/account-timeline'));
export const AccountGallery = lazy(() => import('soapbox/features/account-gallery'));
export const Followers = lazy(() => import('soapbox/features/followers'));
export const Following = lazy(() => import('soapbox/features/following'));
export const FollowRequests = lazy(() => import('soapbox/features/follow-requests'));
export const GenericNotFound = lazy(() => import('soapbox/features/generic-not-found'));
export const FavouritedStatuses = lazy(() => import('soapbox/features/favourited-statuses'));
export const Blocks = lazy(() => import('soapbox/features/blocks'));
export const DomainBlocks = lazy(() => import('soapbox/features/domain-blocks'));
export const Mutes = lazy(() => import('soapbox/features/mutes'));
export const MuteModal = lazy(() => import('soapbox/features/ui/components/modals/mute-modal'));
export const Filters = lazy(() => import('soapbox/features/filters'));
export const EditFilter = lazy(() => import('soapbox/features/filters/edit-filter'));
export const ReportModal = lazy(() => import('soapbox/features/ui/components/modals/report-modal/report-modal'));
export const AccountModerationModal = lazy(() => import('soapbox/features/ui/components/modals/account-moderation-modal/account-moderation-modal'));
export const MediaGallery = lazy(() => import('soapbox/components/media-gallery'));
export const Video = lazy(() => import('soapbox/features/video'));
export const Audio = lazy(() => import('soapbox/features/audio'));
export const MediaModal = lazy(() => import('soapbox/features/ui/components/modals/media-modal'));
export const VideoModal = lazy(() => import('soapbox/features/ui/components/modals/video-modal'));
export const BoostModal = lazy(() => import('soapbox/features/ui/components/modals/boost-modal'));
export const ConfirmationModal = lazy(() => import('soapbox/features/ui/components/modals/confirmation-modal'));
export const MissingDescriptionModal = lazy(() => import('soapbox/features/ui/components/modals/missing-description-modal'));
export const ActionsModal = lazy(() => import('soapbox/features/ui/components/modals/actions-modal'));
export const HotkeysModal = lazy(() => import('soapbox/features/ui/components/modals/hotkeys-modal'));
export const ComposeModal = lazy(() => import('soapbox/features/ui/components/modals/compose-modal'));
export const ReplyMentionsModal = lazy(() => import('soapbox/features/ui/components/modals/reply-mentions-modal'));
export const UnauthorizedModal = lazy(() => import('soapbox/features/ui/components/modals/unauthorized-modal'));
export const EditFederationModal = lazy(() => import('soapbox/features/ui/components/modals/edit-federation-modal'));
export const EmbedModal = lazy(() => import('soapbox/features/ui/components/modals/embed-modal'));
export const ComponentModal = lazy(() => import('soapbox/features/ui/components/modals/component-modal'));
export const ReblogsModal = lazy(() => import('soapbox/features/ui/components/modals/reblogs-modal'));
export const FavouritesModal = lazy(() => import('soapbox/features/ui/components/modals/favourites-modal'));
export const DislikesModal = lazy(() => import('soapbox/features/ui/components/modals/dislikes-modal'));
export const ReactionsModal = lazy(() => import('soapbox/features/ui/components/modals/reactions-modal'));
export const MentionsModal = lazy(() => import('soapbox/features/ui/components/modals/mentions-modal'));
export const LandingPageModal = lazy(() => import('soapbox/features/ui/components/modals/landing-page-modal'));
export const BirthdaysModal = lazy(() => import('soapbox/features/ui/components/modals/birthdays-modal'));
export const BirthdayPanel = lazy(() => import('soapbox/components/birthday-panel'));
export const ListEditor = lazy(() => import('soapbox/features/list-editor'));
export const ListAdder = lazy(() => import('soapbox/features/list-adder'));
export const Search = lazy(() => import('soapbox/features/search'));
export const LoginPage = lazy(() => import('soapbox/features/auth-login/components/login-page'));
export const ExternalLogin = lazy(() => import('soapbox/features/external-login'));
export const LogoutPage = lazy(() => import('soapbox/features/auth-login/components/logout'));
export const RegistrationPage = lazy(() => import('soapbox/features/auth-login/components/registration-page'));
export const Settings = lazy(() => import('soapbox/features/settings'));
export const EditProfile = lazy(() => import('soapbox/features/edit-profile'));
export const EditEmail = lazy(() => import('soapbox/features/edit-email'));
export const EmailConfirmation = lazy(() => import('soapbox/features/email-confirmation'));
export const EditPassword = lazy(() => import('soapbox/features/edit-password'));
export const DeleteAccount = lazy(() => import('soapbox/features/delete-account'));
export const SoapboxConfig = lazy(() => import('soapbox/features/soapbox-config'));
export const ExportData = lazy(() => import('soapbox/features/export-data'));
export const ImportData = lazy(() => import('soapbox/features/import-data'));
export const Backups = lazy(() => import('soapbox/features/backups'));
export const PasswordReset = lazy(() => import('soapbox/features/auth-login/components/password-reset'));
export const PasswordResetConfirm = lazy(() => import('soapbox/features/auth-login/components/password-reset-confirm'));
export const MfaForm = lazy(() => import('soapbox/features/security/mfa-form'));
export const ChatIndex = lazy(() => import('soapbox/features/chats'));
export const ChatWidget = lazy(() => import('soapbox/features/chats/components/chat-widget/chat-widget'));
export const ServerInfo = lazy(() => import('soapbox/features/server-info'));
export const Dashboard = lazy(() => import('soapbox/features/admin'));
export const ModerationLog = lazy(() => import('soapbox/features/admin/moderation-log'));
export const ThemeEditor = lazy(() => import('soapbox/features/theme-editor'));
export const UserPanel = lazy(() => import('soapbox/features/ui/components/user-panel'));
export const PromoPanel = lazy(() => import('soapbox/features/ui/components/promo-panel'));
export const SignUpPanel = lazy(() => import('soapbox/features/ui/components/panels/sign-up-panel'));
export const CtaBanner = lazy(() => import('soapbox/features/ui/components/cta-banner'));
export const FundingPanel = lazy(() => import('soapbox/features/ui/components/funding-panel'));
export const TrendsPanel = lazy(() => import('soapbox/features/ui/components/trends-panel'));
export const ProfileInfoPanel = lazy(() => import('soapbox/features/ui/components/profile-info-panel'));
export const ProfileMediaPanel = lazy(() => import('soapbox/features/ui/components/profile-media-panel'));
export const ProfileFieldsPanel = lazy(() => import('soapbox/features/ui/components/profile-fields-panel'));
export const PinnedAccountsPanel = lazy(() => import('soapbox/features/ui/components/pinned-accounts-panel'));
export const InstanceInfoPanel = lazy(() => import('soapbox/features/ui/components/instance-info-panel'));
export const InstanceModerationPanel = lazy(() => import('soapbox/features/ui/components/instance-moderation-panel'));
export const LatestAccountsPanel = lazy(() => import('soapbox/features/admin/components/latest-accounts-panel'));
export const SidebarMenu = lazy(() => import('soapbox/components/sidebar-menu'));
export const ModalContainer = lazy(() => import('soapbox/features/ui/containers/modal-container'));
export const ProfileHoverCard = lazy(() => import('soapbox/components/profile-hover-card'));
export const StatusHoverCard = lazy(() => import('soapbox/components/status-hover-card'));
export const CryptoDonate = lazy(() => import('soapbox/features/crypto-donate'));
export const CryptoDonatePanel = lazy(() => import('soapbox/features/crypto-donate/components/crypto-donate-panel'));
export const CryptoAddress = lazy(() => import('soapbox/features/crypto-donate/components/crypto-address'));
export const CryptoDonateModal = lazy(() => import('soapbox/features/ui/components/modals/crypto-donate-modal'));
export const LightningAddress = lazy(() => import('soapbox/features/crypto-donate/components/lightning-address'));
export const ScheduledStatuses = lazy(() => import('soapbox/features/scheduled-statuses'));
export const UserIndex = lazy(() => import('soapbox/features/admin/user-index'));
export const FederationRestrictions = lazy(() => import('soapbox/features/federation-restrictions'));
export const Aliases = lazy(() => import('soapbox/features/aliases'));
export const Migration = lazy(() => import('soapbox/features/migration'));
export const WhoToFollowPanel = lazy(() => import('soapbox/features/ui/components/who-to-follow-panel'));
export const FollowRecommendations = lazy(() => import('soapbox/features/follow-recommendations'));
export const Directory = lazy(() => import('soapbox/features/directory'));
export const RegisterInvite = lazy(() => import('soapbox/features/register-invite'));
export const Share = lazy(() => import('soapbox/features/share'));
export const NewStatus = lazy(() => import('soapbox/features/new-status'));
export const IntentionalError = lazy(() => import('soapbox/features/intentional-error'));
export const Developers = lazy(() => import('soapbox/features/developers'));
export const CreateApp = lazy(() => import('soapbox/features/developers/apps/create'));
export const SettingsStore = lazy(() => import('soapbox/features/developers/settings-store'));
export const TestTimeline = lazy(() => import('soapbox/features/test-timeline'));
export const ServiceWorkerInfo = lazy(() => import('soapbox/features/developers/service-worker-info'));
export const DatePicker = lazy(() => import('soapbox/features/birthdays/date-picker'));
export const CompareHistoryModal = lazy(() => import('soapbox/features/ui/components/modals/compare-history-modal'));
export const AuthTokenList = lazy(() => import('soapbox/features/auth-token-list'));
export const FamiliarFollowersModal = lazy(() => import('soapbox/features/ui/components/modals/familiar-followers-modal'));
export const AnnouncementsPanel = lazy(() => import('soapbox/components/announcements/announcements-panel'));
export const Quotes = lazy(() => import('soapbox/features/quotes'));
export const ComposeEventModal = lazy(() => import('soapbox/features/ui/components/modals/compose-event-modal/compose-event-modal'));
export const JoinEventModal = lazy(() => import('soapbox/features/ui/components/modals/join-event-modal'));
export const EventHeader = lazy(() => import('soapbox/features/event/components/event-header'));
export const EventInformation = lazy(() => import('soapbox/features/event/event-information'));
export const EventDiscussion = lazy(() => import('soapbox/features/event/event-discussion'));
export const EventMapModal = lazy(() => import('soapbox/features/ui/components/modals/event-map-modal'));
export const EventParticipantsModal = lazy(() => import('soapbox/features/ui/components/modals/event-participants-modal'));
export const Events = lazy(() => import('soapbox/features/events'));
export const Groups = lazy(() => import('soapbox/features/groups'));
export const GroupsDiscover = lazy(() => import('soapbox/features/groups/discover'));
export const GroupsPopular = lazy(() => import('soapbox/features/groups/popular'));
export const GroupsSuggested = lazy(() => import('soapbox/features/groups/suggested'));
export const GroupsTag = lazy(() => import('soapbox/features/groups/tag'));
export const GroupsTags = lazy(() => import('soapbox/features/groups/tags'));
export const PendingGroupRequests = lazy(() => import('soapbox/features/groups/pending-requests'));
export const GroupMembers = lazy(() => import('soapbox/features/group/group-members'));
export const GroupTags = lazy(() => import('soapbox/features/group/group-tags'));
export const GroupTagTimeline = lazy(() => import('soapbox/features/group/group-tag-timeline'));
export const GroupTimeline = lazy(() => import('soapbox/features/group/group-timeline'));
export const ManageGroup = lazy(() => import('soapbox/features/group/manage-group'));
export const EditGroup = lazy(() => import('soapbox/features/group/edit-group'));
export const GroupBlockedMembers = lazy(() => import('soapbox/features/group/group-blocked-members'));
export const GroupMembershipRequests = lazy(() => import('soapbox/features/group/group-membership-requests'));
export const GroupGallery = lazy(() => import('soapbox/features/group/group-gallery'));
export const CreateGroupModal = lazy(() => import('soapbox/features/ui/components/modals/manage-group-modal/create-group-modal'));
export const NewGroupPanel = lazy(() => import('soapbox/features/ui/components/panels/new-group-panel'));
export const MyGroupsPanel = lazy(() => import('soapbox/features/ui/components/panels/my-groups-panel'));
export const SuggestedGroupsPanel = lazy(() => import('soapbox/features/ui/components/panels/suggested-groups-panel'));
export const GroupMediaPanel = lazy(() => import('soapbox/features/ui/components/group-media-panel'));
export const NewEventPanel = lazy(() => import('soapbox/features/ui/components/panels/new-event-panel'));
export const Announcements = lazy(() => import('soapbox/features/admin/announcements'));
export const EditAnnouncementModal = lazy(() => import('soapbox/features/ui/components/modals/edit-announcement-modal'));
export const FollowedTags = lazy(() => import('soapbox/features/followed-tags'));
export const AccountNotePanel = lazy(() => import('soapbox/features/ui/components/panels/account-note-panel'));
export const ComposeEditor = lazy(() => import('soapbox/features/compose/editor'));
export const OnboardingFlowModal = lazy(() => import('soapbox/features/ui/components/modals/onboarding-flow-modal/onboarding-flow-modal'));
export const NostrSignupModal = lazy(() => import('soapbox/features/ui/components/modals/nostr-signup-modal/nostr-signup-modal'));
export const NostrLoginModal = lazy(() => import('soapbox/features/ui/components/modals/nostr-login-modal/nostr-login-modal'));
export const BookmarkFolders = lazy(() => import('soapbox/features/bookmark-folders'));
export const EditBookmarkFolderModal = lazy(() => import('soapbox/features/ui/components/modals/edit-bookmark-folder-modal'));
export const SelectBookmarkFolderModal = lazy(() => import('soapbox/features/ui/components/modals/select-bookmark-folder-modal'));
export const EditIdentity = lazy(() => import('soapbox/features/edit-identity'));
export const Domains = lazy(() => import('soapbox/features/admin/domains'));
export const EditDomainModal = lazy(() => import('soapbox/features/ui/components/modals/edit-domain-modal'));
export const NostrRelays = lazy(() => import('soapbox/features/nostr-relays'));
export const Bech32Redirect = lazy(() => import('soapbox/features/nostr/Bech32Redirect'));
export const ManageZapSplit = lazy(() => import('soapbox/features/admin/manage-zap-split'));
export const Relays = lazy(() => import('soapbox/features/admin/relays'));
export const Rules = lazy(() => import('soapbox/features/admin/rules'));
export const EditRuleModal = lazy(() => import('soapbox/features/ui/components/modals/edit-rule-modal'));
export const AdminNostrRelays = lazy(() => import('soapbox/features/admin/nostr-relays'));
export const ZapPayRequestModal = lazy(() => import('soapbox/features/ui/components/modals/zap-pay-request-modal'));
export const ZapInvoiceModal = lazy(() => import('soapbox/features/ui/components/modals/zap-invoice'));
export const ZapsModal = lazy(() => import('soapbox/features/ui/components/modals/zaps-modal'));
export const ZapSplitModal = lazy(() => import('soapbox/features/ui/components/modals/zap-split/zap-split-modal'));
