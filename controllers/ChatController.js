const Chat = require("../models/Chat");
const User = require("../models/User");

exports.accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) return res.sendStatus(400);

    // Look for a chat between the logged-in user and the target userId
    var isChat = await Chat.find({
        users: { $all: [req.user.id, userId] },
    })
    .populate("users", "-password")
    .populate("latestMessage");

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        // If no chat exists, create a new one
        var chatData = {
            chatName: "sender",
            users: [req.user.id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

exports.fetchChats = async (req, res) => {
    try {
        // Get all chats the user is part of
        Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
            .populate("users", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(results => res.status(200).send(results));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};