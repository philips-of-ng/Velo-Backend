const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  searchUsers, 
  getMe, 
  updateProfile,
  getSuggestions,     // New: For the "People you may know" list
  updateLocation,    // New: To send GPS coords from the phone
  getStudentLocations // New: To fetch pins for the Discover map
} = require("../controllers/UserController");
const { protect } = require("../middleware/authMiddleware");

// --- Public routes ---
router.post("/register", register);
router.post("/login", login);

// --- Protected routes (Velo Core) ---
router.get("/me", protect, getMe);
router.get("/search", protect, searchUsers);
router.put("/profile", protect, updateProfile);

// --- Discovery & Networking (New Features) ---
// Gets classmates in your department for the "New Chat" screen
router.get("/suggestions", protect, getSuggestions);

// Map logic: Update your coords and fetch others
router.post("/update-location", protect, updateLocation);
router.get("/locations", protect, getStudentLocations);

module.exports = router;