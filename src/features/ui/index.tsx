import clsx from 'clsx';
import { Suspense, lazy, useEffect, useRef } from 'react';
import { Switch, useHistory, useLocation, Redirect } from 'react-router-dom';

import { fetchFollowRequests } from 'soapbox/actions/accounts.ts';
import { fetchReports, fetchUsers, fetchConfig } from 'soapbox/actions/admin.ts';
import { fetchFilters } from 'soapbox/actions/filters.ts';
import { fetchMarker } from 'soapbox/actions/markers.ts';
import { expandNotifications } from 'soapbox/actions/notifications.ts';
import { registerPushNotifications } from 'soapbox/actions/push-notifications/registerer.ts';
import { fetchScheduledStatuses } from 'soapbox/actions/scheduled-statuses.ts';
import { fetchSuggestionsForTimeline } from 'soapbox/actions/suggestions.ts';
import { expandFollowsTimeline } from 'soapbox/actions/timelines.ts';
import { useUserStream } from 'soapbox/api/hooks/index.ts';
import { useCustomEmojis } from 'soapbox/api/hooks/useCustomEmojis.ts';
import SidebarNavigation from 'soapbox/components/sidebar-navigation.tsx';
import ThumbNavigation from 'soapbox/components/thumb-navigation.tsx';
import Layout from 'soapbox/components/ui/layout.tsx';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useDraggedFiles } from 'soapbox/hooks/useDraggedFiles.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useLoggedIn } from 'soapbox/hooks/useLoggedIn.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import AdminPage from 'soapbox/pages/admin-page.tsx';
import ChatsPage from 'soapbox/pages/chats-page.tsx';
import DefaultPage from 'soapbox/pages/default-page.tsx';
import EmptyPage from 'soapbox/pages/empty-page.tsx';
import EventPage from 'soapbox/pages/event-page.tsx';
import EventsPage from 'soapbox/pages/events-page.tsx';
import GroupPage from 'soapbox/pages/group-page.tsx';
import GroupsPage from 'soapbox/pages/groups-page.tsx';
import GroupsPendingPage from 'soapbox/pages/groups-pending-page.tsx';
import HomePage from 'soapbox/pages/home-page.tsx';
import LandingPage from 'soapbox/pages/landing-page.tsx';
import ManageGroupsPage from 'soapbox/pages/manage-groups-page.tsx';
import ProfilePage from 'soapbox/pages/profile-page.tsx';
import RemoteInstancePage from 'soapbox/pages/remote-instance-page.tsx';
import ExplorePage from 'soapbox/pages/search-page.tsx';
import StatusPage from 'soapbox/pages/status-page.tsx';
import WidePage from 'soapbox/pages/wide-page.tsx';

import FloatingActionButton from './components/floating-action-button.tsx';
import Navbar from './components/navbar.tsx';
import {
  Status,
  RemoteTimeline,
  PublicTimeline,
  AccountTimeline,
  AccountGallery,
  HomeTimeline,
  Followers,
  Following,
  DirectTimeline,
  Conversations,
  HashtagTimeline,
  Notifications,
  FollowRequests,
  GenericNotFound,
  FavouritedStatuses,
  Blocks,
  DomainBlocks,
  Mutes,
  Filters,
  EditFilter,
  PinnedStatuses,
  Explore,
  ListTimeline,
  Lists,
  Bookmarks,
  Settings,
  Wallet,
  WalletRelays,
  WalletMints,
  WalletTransactions,
  EditProfile,
  EditEmail,
  EditPassword,
  EmailConfirmation,
  DeleteAccount,
  SoapboxConfig,
  ExportData,
  ImportData,
  Backups,
  MfaForm,
  ChatIndex,
  ChatWidget,
  ServerInfo,
  Dashboard,
  ModerationLog,
  CryptoDonate,
  ScheduledStatuses,
  UserIndex,
  FederationRestrictions,
  Aliases,
  Migration,
  FollowRecommendations,
  Directory,
  SidebarMenu,
  ProfileHoverCard,
  StatusHoverCard,
  Share,
  NewStatus,
  IntentionalError,
  Developers,
  CreateApp,
  SettingsStore,
  TestTimeline,
  LogoutPage,
  AuthTokenList,
  ThemeEditor,
  Quotes,
  ServiceWorkerInfo,
  EventInformation,
  EventDiscussion,
  Events,
  GroupGallery,
  Groups,
  GroupsDiscover,
  GroupsPopular,
  GroupsSuggested,
  GroupsTag,
  GroupsTags,
  PendingGroupRequests,
  GroupMembers,
  GroupTags,
  GroupTagTimeline,
  GroupTimeline,
  ManageGroup,
  GroupBlockedMembers,
  GroupMembershipRequests,
  Announcements,
  EditGroup,
  FollowedTags,
  AboutPage,
  RegistrationPage,
  LoginPage,
  PasswordReset,
  PasswordResetConfirm,
  RegisterInvite,
  ExternalLogin,
  LandingTimeline,
  EditIdentity,
  Domains,
  NostrRelays,
  Bech32Redirect,
  Relays,
  ManageZapSplit,
  Rules,
  AdminNostrRelays,
  NostrBunkerLogin,
  ManageDittoServer,
} from './util/async-components.ts';
import GlobalHotkeys from './util/global-hotkeys.tsx';
import { WrappedRoute } from './util/react-router-helpers.tsx';

// Dummy import, to make sure that <Status /> ends up in the application bundle.
// Without this it ends up in ~8 very commonly used bundles.
import 'soapbox/components/status.tsx';

interface ISwitchingColumnsArea {
  children: React.ReactNode;
}

const SwitchingColumnsArea: React.FC<ISwitchingColumnsArea> = ({ children }) => {
  const { instance, isNotFound } = useInstance();
  const features = useFeatures();
  const { search } = useLocation();
  const { isLoggedIn } = useLoggedIn();

  const { authenticatedProfile, cryptoAddresses } = useSoapboxConfig();
  const hasCrypto = cryptoAddresses.size > 0;

  // NOTE: Mastodon and Pleroma route some basenames to the backend.
  // When adding new routes, use a basename that does NOT conflict
  // with a known backend route, but DO redirect the backend route
  // to the corresponding component as a fallback.
  // Ex: use /login instead of /auth, but redirect /auth to /login
  return (
    <Switch>
      {isNotFound && <Redirect from='/' to='/login/external' exact />}

      <WrappedRoute path='/email-confirmation' page={EmptyPage} component={EmailConfirmation} publicRoute exact />
      <WrappedRoute path='/logout' page={EmptyPage} component={LogoutPage} publicRoute exact />

      {isLoggedIn ? (
        <WrappedRoute path='/' exact page={HomePage} component={HomeTimeline} content={children} />
      ) : (
        <WrappedRoute path='/' exact page={LandingPage} component={LandingTimeline} content={children} publicRoute />
      )}

      {/*
        NOTE: we cannot nest routes in a fragment
        https://stackoverflow.com/a/68637108
      */}
      {features.federating && <WrappedRoute path='/timeline/local' exact page={HomePage} component={HomeTimeline} content={children} publicRoute />}
      {features.federating && <WrappedRoute path='/timeline/global' exact page={HomePage} component={PublicTimeline} content={children} publicRoute />}
      {features.federating && <WrappedRoute path='/timeline/:instance' exact page={RemoteInstancePage} component={RemoteTimeline} content={children} publicRoute />}

      {features.conversations && <WrappedRoute path='/conversations' page={DefaultPage} component={Conversations} content={children} />}
      {features.directTimeline && <WrappedRoute path='/messages' page={DefaultPage} component={DirectTimeline} content={children} />}
      {(features.conversations && !features.directTimeline) && (
        <WrappedRoute path='/messages' page={DefaultPage} component={Conversations} content={children} />
      )}

      {/* Mastodon web routes */}
      <Redirect from='/web/:path1/:path2/:path3' to='/:path1/:path2/:path3' />
      <Redirect from='/web/:path1/:path2' to='/:path1/:path2' />
      <Redirect from='/web/:path' to='/:path' />
      <Redirect from='/timelines/home' to='/' />
      <Redirect from='/timelines/public/local' to='/timeline/local' />
      <Redirect from='/timelines/public' to='/explore' />
      <Redirect from='/timelines/direct' to='/messages' />

      {/* Pleroma FE web routes */}
      <Redirect from='/main/all' to='/explore' />
      <Redirect from='/main/public' to='/timeline/local' />
      <Redirect from='/main/friends' to='/' />
      <Redirect from='/tag/:id' to='/tags/:id' />
      <Redirect from='/user-settings' to='/settings/profile' />
      <WrappedRoute path='/notice/:statusId' publicRoute exact page={DefaultPage} component={Status} content={children} />
      <Redirect from='/users/:username/statuses/:statusId' to='/@:username/posts/:statusId' />
      <Redirect from='/users/:username/chats' to='/chats' />
      <Redirect from='/users/:username' to='/@:username' />
      <Redirect from='/registration' to='/' exact />

      {/* Gab */}
      <Redirect from='/home' to='/' />

      {/* Mastodon rendered pages */}
      <Redirect from='/admin' to='/soapbox/admin' />
      <Redirect from='/terms' to='/about' />
      <Redirect from='/settings/preferences' to='/settings' />
      <Redirect from='/settings/two_factor_authentication_methods' to='/settings/mfa' />
      <Redirect from='/settings/otp_authentication' to='/settings/mfa' />
      <Redirect from='/settings/applications' to='/developers' />
      <Redirect from='/auth/edit' to='/settings' />
      <Redirect from='/auth/confirmation' to={`/email-confirmation${search}`} />
      <Redirect from='/auth/reset_password' to='/reset-password' />
      <Redirect from='/auth/edit_password' to='/edit-password' />
      <Redirect from='/auth/sign_in' to='/login' />
      <Redirect from='/auth/sign_out' to='/logout' />

      {/* Pleroma hard-coded email URLs */}
      <Redirect from='/registration/:token' to='/invite/:token' />

      {/* Soapbox Legacy redirects */}
      <Redirect from='/canary' to='/about/canary' />
      <Redirect from='/canary.txt' to='/about/canary' />
      <Redirect from='/auth/external' to='/login/external' />
      <Redirect from='/auth/mfa' to='/settings/mfa' />
      <Redirect from='/auth/password/new' to='/reset-password' />
      <Redirect from='/auth/password/edit' to={`/edit-password${search}`} />
      <Redirect from='/timeline/fediverse' to='/explore' />

      <WrappedRoute path='/tags/:id' publicRoute page={DefaultPage} component={HashtagTimeline} content={children} />

      {features.lists && <WrappedRoute path='/lists' page={DefaultPage} component={Lists} content={children} />}
      {features.lists && <WrappedRoute path='/list/:id' page={DefaultPage} component={ListTimeline} content={children} />}
      {features.bookmarks && <WrappedRoute path='/bookmarks' page={DefaultPage} component={Bookmarks} content={children} />}

      <WrappedRoute path='/notifications' page={DefaultPage} component={Notifications} content={children} />

      <WrappedRoute path='/explore' page={ExplorePage} component={Explore} content={children} publicRoute />
      {features.suggestionsLocal && <WrappedRoute path='/suggestions/local' publicRoute page={DefaultPage} component={FollowRecommendations} content={children} componentParams={{ local: true }} />}
      {features.suggestions && <WrappedRoute path='/suggestions' exact publicRoute page={DefaultPage} component={FollowRecommendations} content={children} />}
      {features.profileDirectory && <WrappedRoute path='/directory' exact publicRoute page={DefaultPage} component={Directory} content={children} />}
      {features.events && <WrappedRoute path='/events' page={EventsPage} component={Events} content={children} />}

      {features.chats && <WrappedRoute path='/chats' exact page={ChatsPage} component={ChatIndex} content={children} />}
      {features.chats && <WrappedRoute path='/chats/new' page={ChatsPage} component={ChatIndex} content={children} />}
      {features.chats && <WrappedRoute path='/chats/settings' page={ChatsPage} component={ChatIndex} content={children} />}
      {features.chats && <WrappedRoute path='/chats/:chatId' page={ChatsPage} component={ChatIndex} content={children} />}

      <WrappedRoute path='/follow_requests' page={DefaultPage} component={FollowRequests} content={children} />
      {features.blocks && <WrappedRoute path='/blocks' page={DefaultPage} component={Blocks} content={children} />}
      {features.domainBlocks && <WrappedRoute path='/domain_blocks' page={DefaultPage} component={DomainBlocks} content={children} />}
      <WrappedRoute path='/mutes' page={DefaultPage} component={Mutes} content={children} />
      {(features.filters || features.filtersV2) && <WrappedRoute path='/filters/new' page={DefaultPage} component={EditFilter} content={children} />}
      {(features.filters || features.filtersV2) && <WrappedRoute path='/filters/:id' page={DefaultPage} component={EditFilter} content={children} />}
      {(features.filters || features.filtersV2) && <WrappedRoute path='/filters' page={DefaultPage} component={Filters} content={children} />}
      {(features.followedHashtagsList) && <WrappedRoute path='/followed_tags' page={DefaultPage} component={FollowedTags} content={children} />}
      <WrappedRoute path='/@:username' publicRoute exact component={AccountTimeline} page={ProfilePage} content={children} />
      <WrappedRoute path='/@:username/with_replies' publicRoute={!authenticatedProfile} component={AccountTimeline} page={ProfilePage} content={children} componentParams={{ withReplies: true }} />
      <WrappedRoute path='/@:username/followers' publicRoute={!authenticatedProfile} component={Followers} page={ProfilePage} content={children} />
      <WrappedRoute path='/@:username/following' publicRoute={!authenticatedProfile} component={Following} page={ProfilePage} content={children} />
      <WrappedRoute path='/@:username/media' publicRoute={!authenticatedProfile} component={AccountGallery} page={ProfilePage} content={children} />
      <WrappedRoute path='/@:username/tagged/:tag' exact component={AccountTimeline} page={ProfilePage} content={children} />
      <WrappedRoute path='/@:username/favorites' component={FavouritedStatuses} page={ProfilePage} content={children} />
      <WrappedRoute path='/@:username/pins' component={PinnedStatuses} page={ProfilePage} content={children} />
      <WrappedRoute path='/@:username/posts/:statusId' publicRoute exact page={StatusPage} component={Status} content={children} />
      <WrappedRoute path='/@:username/posts/:statusId/quotes' publicRoute page={StatusPage} component={Quotes} content={children} />
      {features.events && <WrappedRoute path='/@:username/events/:statusId' publicRoute exact page={EventPage} component={EventInformation} content={children} />}
      {features.events && <WrappedRoute path='/@:username/events/:statusId/discussion' publicRoute exact page={EventPage} component={EventDiscussion} content={children} />}
      <Redirect from='/@:username/:statusId' to='/@:username/posts/:statusId' />
      <WrappedRoute path='/posts/:statusId' publicRoute exact page={DefaultPage} component={Status} content={children} />

      {features.groups && <WrappedRoute path='/groups' exact page={GroupsPage} component={Groups} content={children} />}
      {features.groupsDiscovery && <WrappedRoute path='/groups/discover' exact page={GroupsPage} component={GroupsDiscover} content={children} />}
      {features.groupsDiscovery && <WrappedRoute path='/groups/popular' exact page={GroupsPendingPage} component={GroupsPopular} content={children} />}
      {features.groupsDiscovery && <WrappedRoute path='/groups/suggested' exact page={GroupsPendingPage} component={GroupsSuggested} content={children} />}
      {features.groupsDiscovery && <WrappedRoute path='/groups/tags' exact page={GroupsPendingPage} component={GroupsTags} content={children} />}
      {features.groupsDiscovery && <WrappedRoute path='/groups/discover/tags/:id' exact page={GroupsPendingPage} component={GroupsTag} content={children} />}
      {features.groupsPending && <WrappedRoute path='/groups/pending-requests' exact page={GroupsPendingPage} component={PendingGroupRequests} content={children} />}
      {features.groupsTags && <WrappedRoute path='/groups/:groupId/tags' exact page={GroupPage} component={GroupTags} content={children} />}
      {features.groupsTags && <WrappedRoute path='/groups/:groupId/tag/:id' exact page={GroupsPendingPage} component={GroupTagTimeline} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId' exact page={GroupPage} component={GroupTimeline} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/members' exact page={GroupPage} component={GroupMembers} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/media' publicRoute={!authenticatedProfile} component={GroupGallery} page={GroupPage} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/manage' exact page={ManageGroupsPage} component={ManageGroup} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/manage/edit' exact page={ManageGroupsPage} component={EditGroup} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/manage/blocks' exact page={ManageGroupsPage} component={GroupBlockedMembers} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/manage/requests' exact page={ManageGroupsPage} component={GroupMembershipRequests} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:groupId/posts/:statusId' exact page={StatusPage} component={Status} content={children} />}

      <WrappedRoute path='/statuses/new' page={DefaultPage} component={NewStatus} content={children} exact />
      <WrappedRoute path='/statuses/:statusId' exact page={StatusPage} component={Status} content={children} />
      {features.scheduledStatuses && <WrappedRoute path='/scheduled_statuses' page={DefaultPage} component={ScheduledStatuses} content={children} />}

      <WrappedRoute path='/settings/profile' page={DefaultPage} component={EditProfile} content={children} />
      {features.nip05 && <WrappedRoute path='/settings/identity' page={DefaultPage} component={EditIdentity} content={children} />}
      {features.exportData && <WrappedRoute path='/settings/export' page={DefaultPage} component={ExportData} content={children} />}
      {features.importData && <WrappedRoute path='/settings/import' page={DefaultPage} component={ImportData} content={children} />}
      {features.accountAliases && <WrappedRoute path='/settings/aliases' page={DefaultPage} component={Aliases} content={children} />}
      {features.accountMoving && <WrappedRoute path='/settings/migration' page={DefaultPage} component={Migration} content={children} />}
      {features.backups && <WrappedRoute path='/settings/backups' page={DefaultPage} component={Backups} content={children} />}
      <WrappedRoute path='/settings/relays' page={DefaultPage} component={NostrRelays} content={children} />
      <WrappedRoute path='/settings/email' page={DefaultPage} component={EditEmail} content={children} />
      <WrappedRoute path='/settings/password' page={DefaultPage} component={EditPassword} content={children} />
      <WrappedRoute path='/settings/account' page={DefaultPage} component={DeleteAccount} content={children} />
      <WrappedRoute path='/settings/mfa' page={DefaultPage} component={MfaForm} exact />
      <WrappedRoute path='/settings/tokens' page={DefaultPage} component={AuthTokenList} content={children} />
      <WrappedRoute path='/settings' page={DefaultPage} component={Settings} content={children} />
      <WrappedRoute path='/wallet' page={DefaultPage} component={Wallet} content={children} exact />
      <WrappedRoute path='/wallet/relays' page={DefaultPage} component={WalletRelays} content={children} exact />
      <WrappedRoute path='/wallet/mints' page={DefaultPage} component={WalletMints} content={children} exact />
      <WrappedRoute path='/wallet/transactions' page={DefaultPage} component={WalletTransactions} content={children} exact />
      <WrappedRoute path='/soapbox/config' adminOnly page={DefaultPage} component={SoapboxConfig} content={children} />

      <WrappedRoute path='/soapbox/admin' staffOnly page={AdminPage} component={Dashboard} content={children} exact />
      <WrappedRoute path='/soapbox/admin/approval' staffOnly page={AdminPage} component={Dashboard} content={children} exact />
      {features.nostr && <WrappedRoute path='/soapbox/admin/ditto-server' adminOnly page={WidePage} component={ManageDittoServer} content={children} exact />}
      <WrappedRoute path='/soapbox/admin/reports' staffOnly page={AdminPage} component={Dashboard} content={children} exact />
      <WrappedRoute path='/soapbox/admin/log' staffOnly page={AdminPage} component={ModerationLog} content={children} exact />
      {features.nostr && <WrappedRoute path='/soapbox/admin/zap-split' staffOnly page={WidePage} component={ManageZapSplit} content={children} exact />}
      <WrappedRoute path='/soapbox/admin/users' staffOnly page={AdminPage} component={UserIndex} content={children} exact />
      <WrappedRoute path='/soapbox/admin/theme' staffOnly page={AdminPage} component={ThemeEditor} content={children} exact />
      <WrappedRoute path='/soapbox/admin/relays' staffOnly page={AdminPage} component={Relays} content={children} exact />
      {features.nostr && <WrappedRoute path='/soapbox/admin/nostr/relays' staffOnly page={AdminPage} component={AdminNostrRelays} content={children} exact />}
      {features.adminAnnouncements && <WrappedRoute path='/soapbox/admin/announcements' staffOnly page={AdminPage} component={Announcements} content={children} exact />}
      {features.domains && <WrappedRoute path='/soapbox/admin/domains' staffOnly page={AdminPage} component={Domains} content={children} exact />}
      {features.adminRules && <WrappedRoute path='/soapbox/admin/rules' staffOnly page={AdminPage} component={Rules} content={children} exact />}
      <WrappedRoute path='/info' page={EmptyPage} component={ServerInfo} content={children} />

      <WrappedRoute path='/developers/apps/create' developerOnly page={DefaultPage} component={CreateApp} content={children} />
      <WrappedRoute path='/developers/settings_store' developerOnly page={DefaultPage} component={SettingsStore} content={children} />
      <WrappedRoute path='/developers/timeline' developerOnly page={DefaultPage} component={TestTimeline} content={children} />
      <WrappedRoute path='/developers/sw' developerOnly page={DefaultPage} component={ServiceWorkerInfo} content={children} />
      <WrappedRoute path='/developers' page={DefaultPage} component={Developers} content={children} />
      <WrappedRoute path='/error/network' developerOnly page={EmptyPage} component={lazy(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module: TEST')))} content={children} />
      <WrappedRoute path='/error' developerOnly page={EmptyPage} component={IntentionalError} content={children} />

      {hasCrypto && <WrappedRoute path='/donate/crypto' publicRoute page={DefaultPage} component={CryptoDonate} content={children} />}
      {features.federating && <WrappedRoute path='/federation_restrictions' publicRoute page={DefaultPage} component={FederationRestrictions} content={children} />}

      <WrappedRoute path='/share' page={DefaultPage} component={Share} content={children} exact />

      <WrappedRoute path='/about/:slug?' page={DefaultPage} component={AboutPage} publicRoute exact />

      {(features.accountCreation && instance.registrations.enabled) && (
        <WrappedRoute path='/signup' page={EmptyPage} component={RegistrationPage} publicRoute exact />
      )}

      <WrappedRoute path='/login/nostr' page={DefaultPage} component={NostrBunkerLogin} publicRoute exact />
      <WrappedRoute path='/login/external' page={DefaultPage} component={ExternalLogin} publicRoute exact />
      <WrappedRoute path='/login/add' page={DefaultPage} component={LoginPage} publicRoute exact />
      <WrappedRoute path='/login' page={DefaultPage} component={LoginPage} publicRoute exact />
      <WrappedRoute path='/reset-password' page={DefaultPage} component={PasswordReset} publicRoute exact />
      <WrappedRoute path='/edit-password' page={DefaultPage} component={PasswordResetConfirm} publicRoute exact />
      <WrappedRoute path='/invite/:token' page={DefaultPage} component={RegisterInvite} publicRoute exact />
      <Redirect from='/auth/password/new' to='/reset-password' />
      <Redirect from='/auth/password/edit' to={`/edit-password${search}`} />

      <WrappedRoute path='/:bech32([\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,})' publicRoute page={EmptyPage} component={Bech32Redirect} content={children} />

      <WrappedRoute page={EmptyPage} component={GenericNotFound} content={children} />
    </Switch>
  );
};

interface IUI {
  children?: React.ReactNode;
}

const UI: React.FC<IUI> = ({ children }) => {
  const api = useApi();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const node = useRef<HTMLDivElement | null>(null);
  const me = useAppSelector(state => state.me);
  const { account } = useOwnAccount();
  const instance = useInstance();
  const features = useFeatures();
  const vapidKey = instance.instance.configuration.vapid.public_key;

  const dropdownMenuIsOpen = useAppSelector(state => state.dropdown_menu.isOpen);

  const { isDragging } = useDraggedFiles(node);

  const handleServiceWorkerPostMessage = ({ data }: MessageEvent) => {
    if (data.type === 'navigate') {
      history.push(data.path);
    } else {
      console.warn('Unknown message type:', data.type);
    }
  };

  const handleDragEnter = (e: DragEvent) => e.preventDefault();
  const handleDragLeave = (e: DragEvent) => e.preventDefault();
  const handleDragOver = (e: DragEvent) => e.preventDefault();
  const handleDrop = (e: DragEvent) => e.preventDefault();

  /** Load initial data when a user is logged in */
  const loadAccountData = () => {
    if (!account) return;

    dispatch(expandFollowsTimeline({}, () => {
      dispatch(fetchSuggestionsForTimeline());
    }));

    dispatch(expandNotifications())
      // @ts-ignore
      .then(() => dispatch(fetchMarker(['notifications'])))
      .catch(console.error);

    if (account.staff) {
      dispatch(fetchReports({ resolved: false }));
      dispatch(fetchUsers({ pending: true }));
    }

    if (account.admin) {
      dispatch(fetchConfig());
    }

    setTimeout(() => dispatch(fetchFilters()), 500);

    if (account.locked) {
      setTimeout(() => dispatch(fetchFollowRequests()), 700);
    }

    setTimeout(() => dispatch(fetchScheduledStatuses()), 900);
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerPostMessage);
    }

    if (window.Notification?.permission === 'default') {
      window.setTimeout(() => Notification.requestPermission(), 120 * 1000);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  useUserStream();
  useCustomEmojis();

  // The user has logged in
  useEffect(() => {
    loadAccountData();
  }, [!!account]);

  useEffect(() => {
    if (vapidKey) {
      registerPushNotifications(api, vapidKey).catch(console.warn);
    }
  }, [vapidKey]);

  const shouldHideFAB = (): boolean => {
    const path = location.pathname;
    return Boolean(path.match(/^\/posts\/|^\/search|^\/getting-started|^\/chats/));
  };

  // Wait for login to succeed or fail
  if (me === null) return null;

  const style: React.CSSProperties = {
    pointerEvents: dropdownMenuIsOpen ? 'none' : undefined,
  };

  return (
    <GlobalHotkeys node={node}>
      <div ref={node} style={style}>
        <div
          className={clsx('pointer-events-none fixed z-[90] h-screen w-screen transition', {
            'backdrop-blur': isDragging,
          })}
        />

        <div className='z-10 flex min-h-screen flex-col'>
          <div className='sticky top-0 z-50 lg:hidden'>
            <Navbar />
          </div>

          <Layout>
            <Layout.Sidebar>
              {instance.isSuccess && <SidebarNavigation />}
            </Layout.Sidebar>

            <SwitchingColumnsArea>
              {children}
            </SwitchingColumnsArea>
          </Layout>

          {(me && !shouldHideFAB()) && (
            <div className='fixed bottom-24 right-4 z-40 transition-all lg:hidden rtl:left-4 rtl:right-auto'>
              <FloatingActionButton />
            </div>
          )}

          {me && (
            <Suspense>
              <SidebarMenu />
            </Suspense>
          )}

          {me && features.chats && (
            <div className='hidden xl:block'>
              <Suspense fallback={<div className='fixed bottom-0 z-[99] flex h-16 w-96 animate-pulse flex-col rounded-t-lg bg-white shadow-3xl dark:bg-gray-900 ltr:right-5 rtl:left-5' />}>
                <ChatWidget />
              </Suspense>
            </div>
          )}

          <ThumbNavigation />

          <Suspense>
            <ProfileHoverCard />
          </Suspense>

          <Suspense>
            <StatusHoverCard />
          </Suspense>
        </div>
      </div>
    </GlobalHotkeys>
  );
};

export default UI;
