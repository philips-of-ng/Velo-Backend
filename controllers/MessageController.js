const Message = require("../models/Message");
const Chat = require("../models/Chat"); // Ensure this is imported

// @desc    Send a message
// @route   POST /api/messages/send
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!content || !recipientId) {
      return res
        .status(400)
        .json({ message: "Content and recipientId are required" });
    }

    // 1. Create the message
    let message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      content,
    });

    // 2. Update the Chat model's latestMessage field
    // This allows the Chat List to stay updated in real-time
    await Chat.findOneAndUpdate(
      { users: { $all: [req.user.id, recipientId] } },
      { latestMessage: message._id },
      { new: true },
    );

    // 3. Populate sender info so the frontend knows who sent it
    message = await message.populate("sender", "nickname username avatar");

    res.status(201).json(message);
  } catch (error) {
    console.error("SendMessage Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:userId
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user.id },
      ],
    })
      .populate("sender", "nickname avatar") // Added population for UI avatars
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
