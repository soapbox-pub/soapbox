'use strict';

import React, { useState, useEffect, useRef } from 'react';
import { HotKeys } from 'react-hotkeys';
import { useIntl } from 'react-intl';
import { Switch, useHistory, useLocation, Redirect } from 'react-router-dom';

import { fetchFollowRequests } from 'soapbox/actions/accounts';
import { fetchReports, fetchUsers, fetchConfig } from 'soapbox/actions/admin';
import { fetchAnnouncements } from 'soapbox/actions/announcements';
import { uploadCompose, resetCompose } from 'soapbox/actions/compose';
import { fetchCustomEmojis } from 'soapbox/actions/custom-emojis';
import { uploadEventBanner } from 'soapbox/actions/events';
import { fetchFilters } from 'soapbox/actions/filters';
import { fetchMarker } from 'soapbox/actions/markers';
import { openModal } from 'soapbox/actions/modals';
import { expandNotifications } from 'soapbox/actions/notifications';
import { register as registerPushNotifications } from 'soapbox/actions/push-notifications';
import { fetchScheduledStatuses } from 'soapbox/actions/scheduled-statuses';
import { connectUserStream } from 'soapbox/actions/streaming';
import { fetchSuggestionsForTimeline } from 'soapbox/actions/suggestions';
import { expandHomeTimeline } from 'soapbox/actions/timelines';
import SidebarNavigation from 'soapbox/components/sidebar-navigation';
import ThumbNavigation from 'soapbox/components/thumb-navigation';
import { Layout } from 'soapbox/components/ui';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useAppDispatch, useAppSelector, useOwnAccount, useSoapboxConfig, useFeatures, useInstance } from 'soapbox/hooks';
import AdminPage from 'soapbox/pages/admin-page';
import ChatsPage from 'soapbox/pages/chats-page';
import DefaultPage from 'soapbox/pages/default-page';
import EventPage from 'soapbox/pages/event-page';
import EventsPage from 'soapbox/pages/events-page';
import GroupPage from 'soapbox/pages/group-page';
import GroupsPage from 'soapbox/pages/groups-page';
import HomePage from 'soapbox/pages/home-page';
import ProfilePage from 'soapbox/pages/profile-page';
import RemoteInstancePage from 'soapbox/pages/remote-instance-page';
import StatusPage from 'soapbox/pages/status-page';
import { usePendingPolicy } from 'soapbox/queries/policies';
import { getAccessToken, getVapidKey } from 'soapbox/utils/auth';
import { isStandalone } from 'soapbox/utils/state';

import BackgroundShapes from './components/background-shapes';
import FloatingActionButton from './components/floating-action-button';
import { supportedPolicyIds } from './components/modals/policy-modal';
import Navbar from './components/navbar';
import BundleContainer from './containers/bundle-container';
import {
  Status,
  CommunityTimeline,
  PublicTimeline,
  RemoteTimeline,
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
  PinnedStatuses,
  Search,
  ListTimeline,
  Lists,
  Bookmarks,
  Settings,
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
  UploadArea,
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
  Groups,
  GroupMembers,
  GroupTimeline,
  ManageGroup,
  GroupBlockedMembers,
  GroupMembershipRequests,
  Announcements,
} from './util/async-components';
import { WrappedRoute } from './util/react-router-helpers';

// Dummy import, to make sure that <Status /> ends up in the application bundle.
// Without this it ends up in ~8 very commonly used bundles.
import 'soapbox/components/status';

const EmptyPage = HomePage;

const keyMap = {
  help: '?',
  new: 'n',
  search: 's',
  forceNew: 'option+n',
  reply: 'r',
  favourite: 'f',
  react: 'e',
  boost: 'b',
  mention: 'm',
  open: ['enter', 'o'],
  openProfile: 'p',
  moveDown: ['down', 'j'],
  moveUp: ['up', 'k'],
  back: 'backspace',
  goToHome: 'g h',
  goToNotifications: 'g n',
  goToFavourites: 'g f',
  goToPinned: 'g p',
  goToProfile: 'g u',
  goToBlocked: 'g b',
  goToMuted: 'g m',
  goToRequests: 'g r',
  toggleHidden: 'x',
  toggleSensitive: 'h',
  openMedia: 'a',
};

interface ISwitchingColumnsArea {
  children: React.ReactNode
}

const SwitchingColumnsArea: React.FC<ISwitchingColumnsArea> = ({ children }) => {
  const features = useFeatures();
  const { search } = useLocation();

  const { authenticatedProfile, cryptoAddresses } = useSoapboxConfig();
  const hasCrypto = cryptoAddresses.size > 0;

  // NOTE: Mastodon and Pleroma route some basenames to the backend.
  // When adding new routes, use a basename that does NOT conflict
  // with a known backend route, but DO redirect the backend route
  // to the corresponding component as a fallback.
  // Ex: use /login instead of /auth, but redirect /auth to /login
  return (
    <Switch>
      <WrappedRoute path='/email-confirmation' page={EmptyPage} component={EmailConfirmation} publicRoute exact />
      <WrappedRoute path='/logout' page={EmptyPage} component={LogoutPage} publicRoute exact />

      <WrappedRoute path='/' exact page={HomePage} component={HomeTimeline} content={children} />

      {/*
        NOTE: we cannot nest routes in a fragment
        https://stackoverflow.com/a/68637108
      */}
      {features.federating && <WrappedRoute path='/timeline/local' exact page={HomePage} component={CommunityTimeline} content={children} publicRoute />}
      {features.federating && <WrappedRoute path='/timeline/fediverse' exact page={HomePage} component={PublicTimeline} content={children} publicRoute />}
      {features.federating && <WrappedRoute path='/timeline/:instance' exact page={RemoteInstancePage} component={RemoteTimeline} content={children} />}

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
      <Redirect from='/timelines/public' to='/timeline/fediverse' />
      <Redirect from='/timelines/direct' to='/messages' />

      {/* Pleroma FE web routes */}
      <Redirect from='/main/all' to='/timeline/fediverse' />
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

      <WrappedRoute path='/tags/:id' publicRoute page={DefaultPage} component={HashtagTimeline} content={children} />

      {features.lists && <WrappedRoute path='/lists' page={DefaultPage} component={Lists} content={children} />}
      {features.lists && <WrappedRoute path='/list/:id' page={DefaultPage} component={ListTimeline} content={children} />}
      {features.bookmarks && <WrappedRoute path='/bookmarks' page={DefaultPage} component={Bookmarks} content={children} />}

      <WrappedRoute path='/notifications' page={DefaultPage} component={Notifications} content={children} />

      <WrappedRoute path='/search' page={DefaultPage} component={Search} content={children} />
      {features.suggestions && <WrappedRoute path='/suggestions' publicRoute page={DefaultPage} component={FollowRecommendations} content={children} />}
      {features.profileDirectory && <WrappedRoute path='/directory' publicRoute page={DefaultPage} component={Directory} content={children} />}
      {features.events && <WrappedRoute path='/events' page={EventsPage} component={Events} content={children} />}

      {features.chats && <WrappedRoute path='/chats' exact page={ChatsPage} component={ChatIndex} content={children} />}
      {features.chats && <WrappedRoute path='/chats/new' page={ChatsPage} component={ChatIndex} content={children} />}
      {features.chats && <WrappedRoute path='/chats/settings' page={ChatsPage} component={ChatIndex} content={children} />}
      {features.chats && <WrappedRoute path='/chats/:chatId' page={ChatsPage} component={ChatIndex} content={children} />}

      <WrappedRoute path='/follow_requests' page={DefaultPage} component={FollowRequests} content={children} />
      <WrappedRoute path='/blocks' page={DefaultPage} component={Blocks} content={children} />
      {features.federating && <WrappedRoute path='/domain_blocks' page={DefaultPage} component={DomainBlocks} content={children} />}
      <WrappedRoute path='/mutes' page={DefaultPage} component={Mutes} content={children} />
      {features.filters && <WrappedRoute path='/filters' page={DefaultPage} component={Filters} content={children} />}
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

      {features.groups && <WrappedRoute path='/groups' exact page={GroupsPage} component={Groups} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:id' exact page={GroupPage} component={GroupTimeline} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:id/members' exact page={GroupPage} component={GroupMembers} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:id/manage' exact page={DefaultPage} component={ManageGroup} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:id/manage/blocks' exact page={DefaultPage} component={GroupBlockedMembers} content={children} />}
      {features.groups && <WrappedRoute path='/groups/:id/manage/requests' exact page={DefaultPage} component={GroupMembershipRequests} content={children} />}

      <WrappedRoute path='/statuses/new' page={DefaultPage} component={NewStatus} content={children} exact />
      <WrappedRoute path='/statuses/:statusId' exact page={StatusPage} component={Status} content={children} />
      {features.scheduledStatuses && <WrappedRoute path='/scheduled_statuses' page={DefaultPage} component={ScheduledStatuses} content={children} />}

      <WrappedRoute path='/settings/profile' page={DefaultPage} component={EditProfile} content={children} />
      {features.exportData && <WrappedRoute path='/settings/export' page={DefaultPage} component={ExportData} content={children} />}
      {features.importData && <WrappedRoute path='/settings/import' page={DefaultPage} component={ImportData} content={children} />}
      {features.accountAliases && <WrappedRoute path='/settings/aliases' page={DefaultPage} component={Aliases} content={children} />}
      {features.accountMoving && <WrappedRoute path='/settings/migration' page={DefaultPage} component={Migration} content={children} />}
      {features.backups && <WrappedRoute path='/settings/backups' page={DefaultPage} component={Backups} content={children} />}
      <WrappedRoute path='/settings/email' page={DefaultPage} component={EditEmail} content={children} />
      <WrappedRoute path='/settings/password' page={DefaultPage} component={EditPassword} content={children} />
      <WrappedRoute path='/settings/account' page={DefaultPage} component={DeleteAccount} content={children} />
      <WrappedRoute path='/settings/mfa' page={DefaultPage} component={MfaForm} exact />
      <WrappedRoute path='/settings/tokens' page={DefaultPage} component={AuthTokenList} content={children} />
      <WrappedRoute path='/settings' page={DefaultPage} component={Settings} content={children} />
      <WrappedRoute path='/soapbox/config' adminOnly page={DefaultPage} component={SoapboxConfig} content={children} />

      <WrappedRoute path='/soapbox/admin' staffOnly page={AdminPage} component={Dashboard} content={children} exact />
      <WrappedRoute path='/soapbox/admin/approval' staffOnly page={AdminPage} component={Dashboard} content={children} exact />
      <WrappedRoute path='/soapbox/admin/reports' staffOnly page={AdminPage} component={Dashboard} content={children} exact />
      <WrappedRoute path='/soapbox/admin/log' staffOnly page={AdminPage} component={ModerationLog} content={children} exact />
      <WrappedRoute path='/soapbox/admin/users' staffOnly page={AdminPage} component={UserIndex} content={children} exact />
      <WrappedRoute path='/soapbox/admin/theme' staffOnly page={AdminPage} component={ThemeEditor} content={children} exact />
      <WrappedRoute path='/soapbox/admin/announcements' staffOnly page={AdminPage} component={Announcements} content={children} exact />
      <WrappedRoute path='/info' page={EmptyPage} component={ServerInfo} content={children} />

      <WrappedRoute path='/developers/apps/create' developerOnly page={DefaultPage} component={CreateApp} content={children} />
      <WrappedRoute path='/developers/settings_store' developerOnly page={DefaultPage} component={SettingsStore} content={children} />
      <WrappedRoute path='/developers/timeline' developerOnly page={DefaultPage} component={TestTimeline} content={children} />
      <WrappedRoute path='/developers/sw' developerOnly page={DefaultPage} component={ServiceWorkerInfo} content={children} />
      <WrappedRoute path='/developers' page={DefaultPage} component={Developers} content={children} />
      <WrappedRoute path='/error/network' developerOnly page={EmptyPage} component={() => new Promise((_resolve, reject) => reject())} content={children} />
      <WrappedRoute path='/error' developerOnly page={EmptyPage} component={IntentionalError} content={children} />

      {hasCrypto && <WrappedRoute path='/donate/crypto' publicRoute page={DefaultPage} component={CryptoDonate} content={children} />}
      {features.federating && <WrappedRoute path='/federation_restrictions' publicRoute page={DefaultPage} component={FederationRestrictions} content={children} />}

      <WrappedRoute path='/share' page={DefaultPage} component={Share} content={children} exact />

      <WrappedRoute page={EmptyPage} component={GenericNotFound} content={children} />
    </Switch>
  );
};

interface IUI {
  children?: React.ReactNode
}

const UI: React.FC<IUI> = ({ children }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { data: pendingPolicy } = usePendingPolicy();
  const instance = useInstance();
  const statContext = useStatContext();

  const [draggingOver, setDraggingOver] = useState<boolean>(false);

  const dragTargets = useRef<EventTarget[]>([]);
  const disconnect = useRef<any>(null);
  const node = useRef<HTMLDivElement | null>(null);
  const hotkeys = useRef<HTMLDivElement | null>(null);

  const me = useAppSelector(state => state.me);
  const account = useOwnAccount();
  const features = useFeatures();
  const vapidKey = useAppSelector(state => getVapidKey(state));

  const dropdownMenuIsOpen = useAppSelector(state => state.dropdown_menu.isOpen);
  const accessToken = useAppSelector(state => getAccessToken(state));
  const streamingUrl = instance.urls.get('streaming_api');
  const standalone = useAppSelector(isStandalone);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();

    if (e.target && !dragTargets.current.includes(e.target)) {
      dragTargets.current.push(e.target);
    }

    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
      setDraggingOver(true);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    if (dataTransferIsText(e.dataTransfer)) return false;
    e.preventDefault();
    e.stopPropagation();

    try {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    } catch (err) {
      // Do nothing
    }

    return false;
  };

  const handleDrop = (e: DragEvent) => {
    if (!me) return;

    if (dataTransferIsText(e.dataTransfer)) return;
    e.preventDefault();

    setDraggingOver(false);
    dragTargets.current = [];

    dispatch((_, getState) => {
      if (e.dataTransfer && e.dataTransfer.files.length >= 1) {
        const modals = getState().modals;
        const isModalOpen = modals.last()?.modalType === 'COMPOSE';
        const isEventsModalOpen = modals.last()?.modalType === 'COMPOSE_EVENT';
        if (isEventsModalOpen) dispatch(uploadEventBanner(e.dataTransfer.files[0], intl));
        else dispatch(uploadCompose(isModalOpen ? 'compose-modal' : 'home', e.dataTransfer.files, intl));
      }
    });
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragTargets.current = dragTargets.current.filter(el => el !== e.target && node.current?.contains(el as Node));

    if (dragTargets.current.length > 0) {
      return;
    }

    setDraggingOver(false);
  };

  const dataTransferIsText = (dataTransfer: DataTransfer | null) => {
    return (dataTransfer && Array.from(dataTransfer.types).includes('text/plain') && dataTransfer.items.length === 1);
  };

  const closeUploadModal = () => {
    setDraggingOver(false);
  };

  const handleServiceWorkerPostMessage = ({ data }: MessageEvent) => {
    if (data.type === 'navigate') {
      history.push(data.path);
    } else {
      console.warn('Unknown message type:', data.type);
    }
  };

  const connectStreaming = () => {
    if (!disconnect.current && accessToken && streamingUrl) {
      disconnect.current = dispatch(connectUserStream({ statContext }));
    }
  };

  const disconnectStreaming = () => {
    if (disconnect.current) {
      disconnect.current();
      disconnect.current = null;
    }
  };

  /** Load initial data when a user is logged in */
  const loadAccountData = () => {
    if (!account) return;

    dispatch(expandHomeTimeline({}, () => {
      dispatch(fetchSuggestionsForTimeline());
    }));

    dispatch(expandNotifications())
      // @ts-ignore
      .then(() => dispatch(fetchMarker(['notifications'])))
      .catch(console.error);

    dispatch(fetchAnnouncements());

    if (account.staff) {
      dispatch(fetchReports({ resolved: false }));
      dispatch(fetchUsers(['local', 'need_approval']));
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
    document.addEventListener('dragenter', handleDragEnter, false);
    document.addEventListener('dragover', handleDragOver, false);
    document.addEventListener('drop', handleDrop, false);
    document.addEventListener('dragleave', handleDragLeave, false);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerPostMessage);
    }

    if (window.Notification?.permission === 'default') {
      window.setTimeout(() => Notification.requestPermission(), 120 * 1000);
    }

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragleave', handleDragLeave);
      disconnectStreaming();
    };
  }, []);

  useEffect(() => {
    connectStreaming();
  }, [accessToken, streamingUrl]);

  // The user has logged in
  useEffect(() => {
    loadAccountData();
    dispatch(fetchCustomEmojis());
  }, [!!account]);

  useEffect(() => {
    dispatch(registerPushNotifications());
  }, [vapidKey]);

  useEffect(() => {
    if (account && pendingPolicy && supportedPolicyIds.includes(pendingPolicy.pending_policy_id)) {
      setTimeout(() => {
        dispatch(openModal('POLICY'));
      }, 500);
    }
  }, [pendingPolicy, !!account]);

  const handleHotkeyNew = (e?: KeyboardEvent) => {
    e?.preventDefault();
    if (!node.current) return;

    const element = node.current.querySelector('textarea#compose-textarea') as HTMLTextAreaElement;

    if (element) {
      element.focus();
    }
  };

  const handleHotkeySearch = (e?: KeyboardEvent) => {
    e?.preventDefault();
    if (!node.current) return;

    const element = node.current.querySelector('input#search') as HTMLInputElement;

    if (element) {
      element.focus();
    }
  };

  const handleHotkeyForceNew = (e?: KeyboardEvent) => {
    handleHotkeyNew(e);
    dispatch(resetCompose());
  };

  const handleHotkeyBack = () => {
    if (window.history && window.history.length === 1) {
      history.push('/');
    } else {
      history.goBack();
    }
  };

  const setHotkeysRef: React.LegacyRef<HotKeys> = (c: any) => {
    hotkeys.current = c;

    if (!me || !hotkeys.current) return;

    // @ts-ignore
    hotkeys.current.__mousetrap__.stopCallback = (_e, element) => {
      return ['TEXTAREA', 'SELECT', 'INPUT', 'EM-EMOJI-PICKER'].includes(element.tagName);
    };
  };

  const handleHotkeyToggleHelp = () => {
    dispatch(openModal('HOTKEYS'));
  };

  const handleHotkeyGoToHome = () => {
    history.push('/');
  };

  const handleHotkeyGoToNotifications = () => {
    history.push('/notifications');
  };

  const handleHotkeyGoToFavourites = () => {
    if (!account) return;
    history.push(`/@${account.username}/favorites`);
  };

  const handleHotkeyGoToPinned = () => {
    if (!account) return;
    history.push(`/@${account.username}/pins`);
  };

  const handleHotkeyGoToProfile = () => {
    if (!account) return;
    history.push(`/@${account.username}`);
  };

  const handleHotkeyGoToBlocked = () => {
    history.push('/blocks');
  };

  const handleHotkeyGoToMuted = () => {
    history.push('/mutes');
  };

  const handleHotkeyGoToRequests = () => {
    history.push('/follow_requests');
  };

  const shouldHideFAB = (): boolean => {
    const path = location.pathname;
    return Boolean(path.match(/^\/posts\/|^\/search|^\/getting-started|^\/chats/));
  };

  // Wait for login to succeed or fail
  if (me === null) return null;

  type HotkeyHandlers = { [key: string]: (keyEvent?: KeyboardEvent) => void };

  const handlers: HotkeyHandlers = {
    help: handleHotkeyToggleHelp,
    new: handleHotkeyNew,
    search: handleHotkeySearch,
    forceNew: handleHotkeyForceNew,
    back: handleHotkeyBack,
    goToHome: handleHotkeyGoToHome,
    goToNotifications: handleHotkeyGoToNotifications,
    goToFavourites: handleHotkeyGoToFavourites,
    goToPinned: handleHotkeyGoToPinned,
    goToProfile: handleHotkeyGoToProfile,
    goToBlocked: handleHotkeyGoToBlocked,
    goToMuted: handleHotkeyGoToMuted,
    goToRequests: handleHotkeyGoToRequests,
  };

  const style: React.CSSProperties = {
    pointerEvents: dropdownMenuIsOpen ? 'none' : undefined,
  };

  return (
    <HotKeys keyMap={keyMap} handlers={me ? handlers : undefined} ref={setHotkeysRef} attach={window} focused>
      <div ref={node} style={style}>
        <BackgroundShapes />

        <div className='z-10 flex flex-col'>
          <Navbar />

          <Layout>
            <Layout.Sidebar>
              {!standalone && <SidebarNavigation />}
            </Layout.Sidebar>

            <SwitchingColumnsArea>
              {children}
            </SwitchingColumnsArea>
          </Layout>

          {(me && !shouldHideFAB()) && (
            <div className='fixed bottom-24 right-4 z-40 transition-all rtl:left-4 rtl:right-auto lg:hidden'>
              <FloatingActionButton />
            </div>
          )}

          <BundleContainer fetchComponent={UploadArea}>
            {Component => <Component active={draggingOver} onClose={closeUploadModal} />}
          </BundleContainer>

          {me && (
            <BundleContainer fetchComponent={SidebarMenu}>
              {Component => <Component />}
            </BundleContainer>
          )}

          {me && features.chats && (
            <BundleContainer fetchComponent={ChatWidget}>
              {Component => (
                <div className='hidden xl:block'>
                  <Component />
                </div>
              )}
            </BundleContainer>
          )}
          <ThumbNavigation />

          <BundleContainer fetchComponent={ProfileHoverCard}>
            {Component => <Component />}
          </BundleContainer>

          <BundleContainer fetchComponent={StatusHoverCard}>
            {Component => <Component />}
          </BundleContainer>
        </div>
      </div>
    </HotKeys>
  );
};

export default UI;
