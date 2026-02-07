const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://via.placeholder.com/150' },
  
  // Campus Identity
  nickname: { type: String }, 
  department: { type: String, default: 'Mathematics' }, 
  gradYear: { type: Number, default: 2028 }, 

  // Location & Privacy
  locationSharing: { 
    type: Boolean, 
    default: false 
  },
  lastSeenLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // Store as [longitude, latitude]
      index: '2dsphere' // Critical for geospatial queries
    }
  }
}, { timestamps: true });

// Ensure the index is created for location-based searches
userSchema.index({ lastSeenLocation: "2dsphere" });

module.exports = mongoose.model('User', userSchema);