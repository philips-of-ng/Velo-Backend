const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages/send
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    
    const message = await Message.create({
      sender: req.user.id, // From your protect middleware
      recipient: recipientId,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:userId
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user.id }
      ]
    }).sort({ createdAt: -1 }); // Sort newest first for the FlatList 'inverted' prop

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};