import { getLocale, getSettings } from 'soapbox/actions/settings';
import messages from 'soapbox/locales/messages';
import { ChatKeys, IChat, isLastMessage } from 'soapbox/queries/chats';
import { queryClient } from 'soapbox/queries/client';
import { getUnreadChatsCount, updateChatListItem, updateChatMessage } from 'soapbox/utils/chats';
import { removePageItem } from 'soapbox/utils/queries';
import { play, soundCache } from 'soapbox/utils/sounds';

import { connectStream } from '../stream';

import {
  deleteAnnouncement,
  updateAnnouncements,
  updateReaction as updateAnnouncementsReaction,
} from './announcements';
import { updateConversations } from './conversations';
import { fetchFilters } from './filters';
import { MARKER_FETCH_SUCCESS } from './markers';
import { updateNotificationsQueue } from './notifications';
import { updateStatus } from './statuses';
import {
  // deleteFromTimelines,
  connectTimeline,
  disconnectTimeline,
  processTimelineUpdate,
} from './timelines';

import type { IStatContext } from 'soapbox/contexts/stat-context';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Chat } from 'soapbox/types/entities';

const STREAMING_CHAT_UPDATE = 'STREAMING_CHAT_UPDATE';
const STREAMING_FOLLOW_RELATIONSHIPS_UPDATE = 'STREAMING_FOLLOW_RELATIONSHIPS_UPDATE';

const updateFollowRelationships = (relationships: APIEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const me = getState().me;
    return dispatch({
      type: STREAMING_FOLLOW_RELATIONSHIPS_UPDATE,
      me,
      ...relationships,
    });
  };

const removeChatMessage = (payload: string) => {
  const data = JSON.parse(payload);
  const chatId = data.chat_id;
  const chatMessageId = data.deleted_message_id;

  // If the user just deleted the "last_message", then let's invalidate
  // the Chat Search query so the Chat List will show the new "last_message".
  if (isLastMessage(chatMessageId)) {
    queryClient.invalidateQueries(ChatKeys.chatSearch());
  }

  removePageItem(ChatKeys.chatMessages(chatId), chatMessageId, (o: any, n: any) => String(o.id) === String(n));
};

// Update the specific Chat query data.
const updateChatQuery = (chat: IChat) => {
  const cachedChat = queryClient.getQueryData<IChat>(ChatKeys.chat(chat.id));
  if (!cachedChat) {
    return;
  }

  const newChat = {
    ...cachedChat,
    latest_read_message_by_account: chat.latest_read_message_by_account,
    latest_read_message_created_at: chat.latest_read_message_created_at,
  };
  queryClient.setQueryData<Chat>(ChatKeys.chat(chat.id), newChat as any);
};

interface TimelineStreamOpts {
  statContext?: IStatContext
  enabled?: boolean
}

const connectTimelineStream = (
  timelineId: string,
  path: string,
  pollingRefresh: ((dispatch: AppDispatch, done?: () => void) => void) | null = null,
  accept: ((status: APIEntity) => boolean) | null = null,
  opts?: TimelineStreamOpts,
) => connectStream(path, pollingRefresh, (dispatch: AppDispatch, getState: () => RootState) => {
  const locale = getLocale(getState());

  return {
    onConnect() {
      dispatch(connectTimeline(timelineId));
    },

    onDisconnect() {
      dispatch(disconnectTimeline(timelineId));
    },

    onReceive(websocket, data: any) {
      switch (data.event) {
        case 'update':
          dispatch(processTimelineUpdate(timelineId, JSON.parse(data.payload), accept));
          break;
        case 'status.update':
          dispatch(updateStatus(JSON.parse(data.payload)));
          break;
        // FIXME: We think delete & redraft is causing jumpy timelines.
        // Fix that in ScrollableList then re-enable this!
        //
        // case 'delete':
        //   dispatch(deleteFromTimelines(data.payload));
        //   break;
        case 'notification':
          messages[locale]().then(messages => {
            dispatch(
              updateNotificationsQueue(
                JSON.parse(data.payload),
                messages,
                locale,
                window.location.pathname,
              ),
            );
          }).catch(error => {
            console.error(error);
          });
          break;
        case 'conversation':
          dispatch(updateConversations(JSON.parse(data.payload)));
          break;
        case 'filters_changed':
          dispatch(fetchFilters());
          break;
        case 'pleroma:chat_update':
        case 'chat_message.created': // TruthSocial
          dispatch((_dispatch: AppDispatch, getState: () => RootState) => {
            const chat = JSON.parse(data.payload);
            const me = getState().me;
            const messageOwned = chat.last_message?.account_id === me;
            const settings = getSettings(getState());

            // Don't update own messages from streaming
            if (!messageOwned) {
              updateChatListItem(chat);

              if (settings.getIn(['chats', 'sound'])) {
                play(soundCache.chat);
              }

              // Increment unread counter
              opts?.statContext?.setUnreadChatsCount(getUnreadChatsCount());
            }
          });
          break;
        case 'chat_message.deleted': // TruthSocial
          removeChatMessage(data.payload);
          break;
        case 'chat_message.read': // TruthSocial
          dispatch((_dispatch: AppDispatch, getState: () => RootState) => {
            const chat = JSON.parse(data.payload);
            const me = getState().me;
            const isFromOtherUser = chat.account.id !== me;
            if (isFromOtherUser) {
              updateChatQuery(JSON.parse(data.payload));
            }
          });
          break;
        case 'chat_message.reaction': // TruthSocial
          updateChatMessage(JSON.parse(data.payload));
          break;
        case 'pleroma:follow_relationships_update':
          dispatch(updateFollowRelationships(JSON.parse(data.payload)));
          break;
        case 'announcement':
          dispatch(updateAnnouncements(JSON.parse(data.payload)));
          break;
        case 'announcement.reaction':
          dispatch(updateAnnouncementsReaction(JSON.parse(data.payload)));
          break;
        case 'announcement.delete':
          dispatch(deleteAnnouncement(data.payload));
          break;
        case 'marker':
          dispatch({ type: MARKER_FETCH_SUCCESS, marker: JSON.parse(data.payload) });
          break;
        case 'nostr.sign':
          window.nostr?.signEvent(JSON.parse(data.payload))
            .then((data) => websocket.send(JSON.stringify({ type: 'nostr.sign', data })))
            .catch(() => console.warn('Failed to sign Nostr event.'));
          break;
      }
    },
  };
});

const connectHashtagStream   = (id: string, tag: string, accept: (status: APIEntity) => boolean) =>
  connectTimelineStream(`hashtag:${id}`, `hashtag&tag=${tag}`, null, accept);

const connectListStream      = (id: string) =>
  connectTimelineStream(`list:${id}`, `list&list=${id}`);

const connectGroupStream     = (id: string) =>
  connectTimelineStream(`group:${id}`, `group&group=${id}`);

export {
  STREAMING_CHAT_UPDATE,
  STREAMING_FOLLOW_RELATIONSHIPS_UPDATE,
  connectTimelineStream,
  connectHashtagStream,
  connectListStream,
  connectGroupStream,
  type TimelineStreamOpts,
};
