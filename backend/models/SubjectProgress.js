const mongoose = require("mongoose");

const CompletionSchema = new mongoose.Schema(
  {
    completedAt: {
      type: Number,
      required: true,
    },
    revisedAt: Number,
    revisions: {
      type: [Number],
      default: [],
    },
  },
  { _id: false }
);

const SubjectProgressSchema = new mongoose.Schema(
  {
    subjectKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    checkedUids: {
      type: [String],
      default: [],
    },

    completionTimes: {
      type: Map,
      of: CompletionSchema,
      default: {},
    },

    updatedAt: {
      type: Number,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.SubjectProgress ||
  mongoose.model("SubjectProgress", SubjectProgressSchema);