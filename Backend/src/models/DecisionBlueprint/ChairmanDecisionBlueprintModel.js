const mongoose = require("mongoose");

const ChairmanDecisionBlueprintSchema = new mongoose.Schema(
  {
    /* ================= WHO CREATED ================= */
    chairman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: true,
      index: true
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true
    },

    /* ================= SNAPSHOT ================= */
    applications: [
      {
        applicationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "admission_applications",
          required: true
        },

        applicantName: {
          type: String,
          required: true
        },

        program: {
          type: String,
          enum: ["MS", "MBA", "LLM", "PhD"],
          required: true
        },

        meritPoint: {
          type: Number,
          required: true
        },

        rank: {
          type: Number,
          required: true
        },

        status: {
          type: String,
          enum: ["Selected", "Waiting"],
          required: true
        }
      }
    ],

    /* ================= TTL ================= */
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 10 // ⏳ 10 days auto-delete
    }
  },
  {
    versionKey: false,
    timestamps: false
  }
);

/* =================================================
   🚫 PREVENT DUPLICATE BLUEPRINTS
   One blueprint per:
   chairman + department + supervisor
================================================= */
ChairmanDecisionBlueprintSchema.index(
  {
    chairman: 1,
    department: 1,
    supervisor: 1
  },
  { unique: true }
);

module.exports = mongoose.model(
  "chairman_decision_blueprints",
  ChairmanDecisionBlueprintSchema
);
