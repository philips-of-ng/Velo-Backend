const express = require("express");
const router = express.Router();
const { register, login, searchUsers, getMe, updateProfile } = require("../controllers/UserController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (Velo needs these for the frontend)
router.get("/me", protect, getMe);
router.get("/search", protect, searchUsers);
router.put("/profile", updateProfile)

module.exports = router;