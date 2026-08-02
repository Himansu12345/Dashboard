const express = require("express");
const router = express.Router();

const { oauth2Client } = require("../../config/google");

const GoogleAccount = require("../GoogleAccount");

// STEP 1 - Login
router.get("/login", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });

  res.redirect(url);
});

// STEP 2 - Callback
router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({
        error: "Authorization code missing.",
      });
    }
    // Save refresh token

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    // Save refresh token

    // 🛡️ PRO FIX: Protect Refresh Token from being overwritten with undefined
    const updateData = {
      email: "primary-user",
      connectedAt: new Date(),
    };

    if (tokens.refresh_token) {
      updateData.refreshToken = tokens.refresh_token;
    }

    await GoogleAccount.findOneAndUpdate(
      { email: "primary-user" },
      { $set: updateData },
      {
        upsert: true,
        new: true,
      },
    );

    res.json({
      success: true,
      message: "Google Calendar connected successfully.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/test", async (req, res) => {
  try {
    const { createEvent } = require("../../services/googleCalendarService");

    const event = await createEvent({
      summary: "UPSC Dashboard Test",
      description: "Google Calendar integration is working 🚀",

      start: {
        dateTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        timeZone: "Asia/Kolkata",
      },

      end: {
        dateTime: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
        timeZone: "Asia/Kolkata",
      },
    });

    res.json({
      success: true,
      event,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
