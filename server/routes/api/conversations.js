const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
// TODO: for scalability, implement lazy loading
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id"],
      order: [
        [Message, "createdAt", "ASC"],
      ],
      include: [
        { model: Message },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
    });

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      // count unread messages
      const unreadMessages = convoJSON.messages.filter(message => (
        !message.read && 
        message.senderId !== Number(userId)
      ));
      convoJSON.unreadMessages = unreadMessages.length;

      // get the last read message by the other user
      const readMessagesByOtherUser = convoJSON.messages.filter(message => (
        message.read && 
        message.senderId === Number(userId)
      ));
      const lastReadMessage = readMessagesByOtherUser[readMessagesByOtherUser.length - 1] || { id: -1 };
      convoJSON.lastReadMessageByOtherUser = lastReadMessage.id;

      // set properties for notification count and latest message preview
      const latestMessageIndex = convoJSON.messages.length - 1;
      convoJSON.latestMessageText = convoJSON.messages[latestMessageIndex].text;
      conversations[i] = convoJSON;
    }

    // sort conversations using insertion sort method
    for (var i = 1; i < conversations.length; i++) {
      var j = i - 1;
      var auxConvo = conversations[i];
      var aux = conversations[i].messages[conversations[i].messages.length - 1].createdAt;
      while (j >= 0 && conversations[j].messages[conversations[j].messages.length - 1].createdAt < aux) {
        conversations[j + 1] = conversations[j];
        j = j - 1;
      }
      conversations[j + 1] = auxConvo;
    }

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

// update messages read status
router.put('/:id', async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const { userId } = req.body;
    const currentUserId = JSON.stringify(userId);

    const messages = await Message.findAll({
      where: {
        conversationId,
      }
    })

    if (!messages) {
      return res.sendStatus(401);
    }
    
    var lastReadMessage = -1;

    for (let i = 0; i < messages.length; i++) {
      if (messages[i].senderId !== Number(currentUserId)) {
        messages[i].read = true;
        lastReadMessage = messages[i].id
        messages[i].save();
      }
    }

    res.json({ messages, lastReadMessage });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
