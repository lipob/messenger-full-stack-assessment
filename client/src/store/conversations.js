import {
  addNewConvoToStore,
  addOnlineUserToStore,
  addSearchedUsersToStore,
  removeOfflineUserFromStore,
  addMessageToStore,
  updateMessages,
  incrementUnreadMessages,
  updateConvosOrder,
} from "./utils/reducerFunctions";

// ACTIONS

const GET_CONVERSATIONS = "GET_CONVERSATIONS";
const SET_MESSAGE = "SET_MESSAGE";
const ADD_ONLINE_USER = "ADD_ONLINE_USER";
const REMOVE_OFFLINE_USER = "REMOVE_OFFLINE_USER";
const SET_SEARCHED_USERS = "SET_SEARCHED_USERS";
const CLEAR_SEARCHED_USERS = "CLEAR_SEARCHED_USERS";
const ADD_CONVERSATION = "ADD_CONVERSATION";
const RESET_UNREAD_MESSAGES = "RESET_UNREAD_MESSAGES";
const UPDATE_UNREAD_MESSAGES_COUNT = 'UPDATE_UNREAD_MESSAGES_COUNT';
const MOVE_CONVO_TO_TOP = 'MOVE_CONVO_TO_TOP';

// ACTION CREATORS

export const gotConversations = (conversations) => {
  return {
    type: GET_CONVERSATIONS,
    conversations,
  };
};

export const setNewMessage = (message, sender) => {
  return {
    type: SET_MESSAGE,
    payload: { message, sender: sender || null },
  };
};

export const moveConvoToTop = (conversationId) => {
  return {
    type: MOVE_CONVO_TO_TOP,
    conversationId
  }
};

export const addOnlineUser = (id) => {
  return {
    type: ADD_ONLINE_USER,
    id,
  };
};

export const removeOfflineUser = (id) => {
  return {
    type: REMOVE_OFFLINE_USER,
    id,
  };
};

export const setSearchedUsers = (users) => {
  return {
    type: SET_SEARCHED_USERS,
    users,
  };
};

export const clearSearchedUsers = () => {
  return {
    type: CLEAR_SEARCHED_USERS,
  };
};

// add new conversation when sending a new message
export const addConversation = (recipientId, newMessage) => {
  return {
    type: ADD_CONVERSATION,
    payload: { recipientId, newMessage },
  };
};

// reset unread messages
export const resetUnreadMessages = (data, conversationId) => {
  return {
    type: RESET_UNREAD_MESSAGES,
    payload: { data, conversationId },
  };
};

// new unread messages counter
export const updateUnreadMessagesCount = (conversationId) => {
  return {
    type: UPDATE_UNREAD_MESSAGES_COUNT,
    conversationId
  }
};

// REDUCER

const reducer = (state = [], action) => {
  switch (action.type) {
    case GET_CONVERSATIONS:
      return action.conversations;
    case SET_MESSAGE:
      return addMessageToStore(state, action.payload);
    case MOVE_CONVO_TO_TOP:
      return updateConvosOrder(state, action.conversationId);
    case ADD_ONLINE_USER: {
      return addOnlineUserToStore(state, action.id);
    }
    case REMOVE_OFFLINE_USER: {
      return removeOfflineUserFromStore(state, action.id);
    }
    case SET_SEARCHED_USERS:
      return addSearchedUsersToStore(state, action.users);
    case CLEAR_SEARCHED_USERS:
      return state.filter((convo) => convo.id);
    case ADD_CONVERSATION:
      return addNewConvoToStore(
        state,
        action.payload.recipientId,
        action.payload.newMessage
      );
    case RESET_UNREAD_MESSAGES:
      return updateMessages(state, action.payload);
    case UPDATE_UNREAD_MESSAGES_COUNT:
      return incrementUnreadMessages(state, action.conversationId);
    default:
      return state;
  }
};

export default reducer;
