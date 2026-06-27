import { openDB } from "idb";

const DB_NAME = "UPSC_Dashboard_DB";
const DB_VERSION = 2;

let dbPromise = null;

function createDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // ---------------- QUESTION ATTEMPTS ----------------
      if (!db.objectStoreNames.contains("questionAttempts")) {
        const store = db.createObjectStore("questionAttempts", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp");
        store.createIndex("sessionId", "sessionId");
        store.createIndex("subject", "subject");
        store.createIndex("topic", "topic");
        store.createIndex("result", "result");
      }

      // ---------------- NOTE ACTIONS ----------------
      if (!db.objectStoreNames.contains("noteActions")) {
        const store = db.createObjectStore("noteActions", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp");
        store.createIndex("sessionId", "sessionId");
        store.createIndex("subject", "subject");
        store.createIndex("topic", "topic");
        store.createIndex("actionType", "actionType");
      }

      // ---------------- STUDY SESSIONS ----------------
      if (!db.objectStoreNames.contains("studySessions")) {
        const store = db.createObjectStore("studySessions", { keyPath: "id" });
        store.createIndex("startTime", "startTime");
      }
    },
  });
}

export const getDB = async () => {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser.");
  }

  if (!("indexedDB" in window)) {
    throw new Error("IndexedDB is not supported in this browser.");
  }

  if (!dbPromise) {
    dbPromise = createDatabase();
  }

  return dbPromise;
};
