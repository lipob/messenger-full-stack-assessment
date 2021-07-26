import React, { useEffect } from "react";
import { useDispatch } from 'react-redux';
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Input, Header, Messages } from "./index";
import { connect } from "react-redux";
import { updateMessagesReadStatus } from "../../store/utils/thunkCreators";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexGrow: 8,
    flexDirection: "column"
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between"
  }
}));

const ActiveChat = (props) => {
  const classes = useStyles();
  const { user } = props;
  const conversation = props.conversation || {};
  const dispatch = useDispatch();
  const activeConversation = props.activeConversation;

  const conversationId = conversation.id;
  const userId = user.id;

  // reset unread messages when active chat
  useEffect(() => {
    if (conversationId && userId) {
      dispatch(updateMessagesReadStatus(conversationId, userId));
    }
  }, [activeConversation])
  
  // reset unread messages when scroll to bottom
  window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
      if (conversationId && userId) {
        dispatch(updateMessagesReadStatus(conversationId, userId));
      }
    }
  };

  return (
    <Box className={classes.root}>
      {conversation.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            <Messages
              messages={conversation.messages}
              lastReadMessage={conversation.lastReadMessageByOtherUser}
              otherUser={conversation.otherUser}
              userId={user.id}
            />
            <Input
              otherUser={conversation.otherUser}
              conversationId={conversation.id}
              user={user}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    conversation:
      state.conversations &&
      state.conversations.find(
        (conversation) => conversation.otherUser.username === state.activeConversation
      ),
      activeConversation: state.activeConversation
  };
};

export default connect(mapStateToProps, null)(ActiveChat);
