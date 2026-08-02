const { google } = require("googleapis");
const GoogleAccount = require("../models/GoogleAccount");

async function getCalendar() {
  const account = await GoogleAccount.findOne({
    email: "primary-user",
  });

  if (!account) {
    throw new Error("Google account not connected.");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  oauth2Client.setCredentials({
    refresh_token: account.refreshToken,
  });

  return google.calendar({
    version: "v3",
    auth: oauth2Client,
  });
}

async function createEvent(event) {
  const calendar = await getCalendar();

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return response.data;
}

async function deleteEvent(eventId) {
  const calendar = await getCalendar();

  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  });
}

module.exports = {
  createEvent,
  deleteEvent,
};
