const Message = require('../models/Message');

// Save a new message to the database
exports.sendMessage = async (req, res) => {
    try {
        const { roomId, text, recipientId } = req.body;
        const senderId = req.user.id; // From our authMiddleware

        const newMessage = new Message({
            roomId,
            sender: senderId,
            text
        });

        await newMessage.save();
        
        // We populate the sender's name and avatar to show in the UI immediately
        const fullMessage = await newMessage.populate("sender", "username avatar");
        
        res.status(201).json(fullMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all messages for a specific room
exports.getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.find({ roomId })
            .populate("sender", "username avatar")
            .sort({ createdAt: 1 }); // Sort by time (oldest to newest)

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};