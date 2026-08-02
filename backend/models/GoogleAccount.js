const mongoose = require("mongoose");

const GoogleAccountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    refreshToken: {
      type: String,
      required: true,
    },

    calendarId: {
      type: String,
      default: "primary",
    },

    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.GoogleAccount ||
  mongoose.model("GoogleAccount", GoogleAccountSchema);
