const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SEARCH USERS
exports.searchUsers = async (req, res) => {
  try {
    const { nickname } = req.query;
    if (!nickname)
      return res.status(400).json({ msg: "Please enter a nickname" });

    const users = await User.find({
      $or: [
        { nickname: { $regex: nickname, $options: "i" } },
        { username: { $regex: nickname, $options: "i" } },
      ],
      _id: { $ne: req.user.id }, // Don't find yourself
    }).select("nickname username avatar department");

    res.json(users);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { nickname: req.body.nickname },
      { new: true },
    );
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(200).json({ message: "Server Error" });
  }
};

// @desc    Get suggested users in the same department
// @route   GET /api/auth/users/suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    // Find users in the same department, excluding the current user
    const suggestions = await User.find({
      department: currentUser.department,
      _id: { $ne: req.user.id },
    })
      .limit(10)
      .select("nickname username avatar department");

    res.json(suggestions);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
