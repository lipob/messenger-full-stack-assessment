import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  updateLastReadMessageByOther,
} from "./store/conversations";

const token = localStorage.getItem("messenger-token");

const socket = io(window.location.origin, { auth: {token} });

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });
  socket.on("new-message", (data) => {
    store.dispatch(setNewMessage(data.message, data.sender));
  });
  socket.on("read-message", (data) => {
    store.dispatch(updateLastReadMessageByOther(data.message, data.conversation));
  });
});

export default socket;
