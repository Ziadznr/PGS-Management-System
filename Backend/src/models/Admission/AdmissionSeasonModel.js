const mongoose = require("mongoose");

const AdmissionSeasonSchema = new mongoose.Schema(
  {
    seasonName: {
      type: String,
      enum: ["January-June", "July-December"],
      required: true
    },

    academicYear: {
      type: String, // e.g. "2026"
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isLocked: {
      type: Boolean,
      default: false
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin"
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

// 🔒 Prevent duplicate seasons in same academic year
AdmissionSeasonSchema.index(
  { seasonName: 1, academicYear: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.admission_seasons ||
  mongoose.model("admission_seasons", AdmissionSeasonSchema);
