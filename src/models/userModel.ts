import mongoose from 'mongoose'

const user1Schema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    profilePicture: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'offline'
    },
    lastSeen: {
      type: Date,
      default: null
    },
    contacts: [
      {
        username: String,
        email: String,
      }
    ],
    blockedUsers: [
      {
        username: String,
        email: String,
      }
    ],
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
      }
    ],
    bio: {
      type: String,
      default: ''
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    notifications: [
      {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    ]
  }, { timestamps: true });

module.exports = mongoose.model("userProfile", user1Schema)