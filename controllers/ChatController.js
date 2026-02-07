const Chat = require("../models/Chat");
const User = require("../models/User");

// @desc    Create or access a one-on-one chat
exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId)
    return res
      .status(400)
      .json({ message: "UserId param not sent with request" });

  // Find existing chat between these two users
  let isChat = await Chat.find({
    users: { $all: [req.user.id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  // Populate the sender of the latest message
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "nickname username avatar",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    // Create a new conversation if none exists
    const chatData = {
      chatName: "sender",
      users: [req.user.id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password",
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

// @desc    Get all chats for a user, formatted for the Velo UI
exports.fetchChats = async (req, res) => {
  try {
    // Find chats where current user is a participant
    let results = await Chat.find({
      users: { $elemMatch: { $eq: req.user.id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // Deep populate the latest message sender
    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "nickname username avatar",
    });

    // REFORMAT: Mapping the data to match your frontend 'Chat' interface
    const formattedChats = results.map((chat) => {
      // Find the "other" user in the conversation
      const otherUser = chat.users.find(
        (u) => u._id.toString() !== req.user.id,
      );

      return {
        id: otherUser._id, // Used for navigation to chatroom
        name: otherUser.nickname || otherUser.username || "Velo User",
        lastMessage: chat.latestMessage
          ? chat.latestMessage.content
          : "No messages yet",
        time: chat.latestMessage
          ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        avatar: otherUser.avatar || null,
        unreadCount: 0, // Logic to be implemented later
      };
    });

    res.status(200).send(formattedChats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
