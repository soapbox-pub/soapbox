import { getLocale, getSettings } from 'soapbox/actions/settings.ts';
import { updateReactions } from 'soapbox/api/hooks/announcements/useAnnouncements.ts';
import { importEntities } from 'soapbox/entity-store/actions.ts';
import { Entities } from 'soapbox/entity-store/entities.ts';
import { selectEntity } from 'soapbox/entity-store/selectors.ts';
import messages from 'soapbox/messages.ts';
import { ChatKeys, IChat, isLastMessage } from 'soapbox/queries/chats.ts';
import { queryClient } from 'soapbox/queries/client.ts';
import { announcementSchema, type Announcement, type Relationship } from 'soapbox/schemas/index.ts';
import { getUnreadChatsCount, updateChatListItem, updateChatMessage } from 'soapbox/utils/chats.ts';
import { removePageItem } from 'soapbox/utils/queries.ts';
import { play, soundCache } from 'soapbox/utils/sounds.ts';

import { connectStream } from '../stream.ts';

import { updateConversations } from './conversations.ts';
import { fetchFilters } from './filters.ts';
import { MARKER_FETCH_SUCCESS } from './markers.ts';
import { updateNotificationsQueue } from './notifications.ts';
import { updateStatus } from './statuses.ts';
import {
  // deleteFromTimelines,
  connectTimeline,
  disconnectTimeline,
  processTimelineUpdate,
} from './timelines.ts';

import type { IStatContext } from 'soapbox/contexts/stat-context.tsx';
import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { APIEntity, Chat } from 'soapbox/types/entities.ts';

const STREAMING_CHAT_UPDATE = 'STREAMING_CHAT_UPDATE';

const removeChatMessage = (payload: string) => {
  const data = JSON.parse(payload);
  const chatId = data.chat_id;
  const chatMessageId = data.deleted_message_id;

  // If the user just deleted the "last_message", then let's invalidate
  // the Chat Search query so the Chat List will show the new "last_message".
  if (isLastMessage(chatMessageId)) {
    queryClient.invalidateQueries({
      queryKey: ChatKeys.chatSearch(),
    });
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

const updateAnnouncementReactions = ({ announcement_id: id, name, count }: APIEntity) => {
  queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
    prevResult.map(value => {
      if (value.id !== id) return value;

      return announcementSchema.parse({
        ...value,
        reactions: updateReactions(value.reactions, name, -1, true),
      });
    }),
  );
};

const updateAnnouncement = (announcement: APIEntity) =>
  queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) => {
    let updated = false;

    const result = prevResult.map(value => value.id === announcement.id
      ? (updated = true, announcementSchema.parse(announcement))
      : value);

    if (!updated) return [announcementSchema.parse(announcement), ...result];
  });

const deleteAnnouncement = (id: string) =>
  queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
    prevResult.filter(value => value.id !== id),
  );

interface TimelineStreamOpts {
  statContext?: IStatContext;
  enabled?: boolean;
}

const connectTimelineStream = (
  timelineId: string,
  path: string,
  accept: ((status: APIEntity) => boolean) | null = null,
  opts?: TimelineStreamOpts,
) => connectStream(path, (dispatch: AppDispatch, getState: () => RootState) => {
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
          updateAnnouncement(JSON.parse(data.payload));
          break;
        case 'announcement.reaction':
          updateAnnouncementReactions(JSON.parse(data.payload));
          break;
        case 'announcement.delete':
          deleteAnnouncement(data.payload);
          break;
        case 'marker':
          dispatch({ type: MARKER_FETCH_SUCCESS, marker: JSON.parse(data.payload) });
          break;
      }
    },
  };
});

function followStateToRelationship(followState: string) {
  switch (followState) {
    case 'follow_pending':
      return { following: false, requested: true };
    case 'follow_accept':
      return { following: true, requested: false };
    case 'follow_reject':
      return { following: false, requested: false };
    default:
      return {};
  }
}

interface FollowUpdate {
  state: 'follow_pending' | 'follow_accept' | 'follow_reject';
  follower: {
    id: string;
    follower_count: number;
    following_count: number;
  };
  following: {
    id: string;
    follower_count: number;
    following_count: number;
  };
}

function updateFollowRelationships(update: FollowUpdate) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const me = getState().me;
    const relationship = selectEntity<Relationship>(getState(), Entities.RELATIONSHIPS, update.following.id);

    if (update.follower.id === me && relationship) {
      const updated = {
        ...relationship,
        ...followStateToRelationship(update.state),
      };

      // Add a small delay to deal with API race conditions.
      setTimeout(() => dispatch(importEntities([updated], Entities.RELATIONSHIPS)), 300);
    }
  };
}

export {
  STREAMING_CHAT_UPDATE,
  connectTimelineStream,
  type TimelineStreamOpts,
};
