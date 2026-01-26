const mongoose = require("mongoose");

const AdmissionPaymentSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true
    },

    program: {
      type: String,
      enum: ["MS", "MBA", "LLM", "PhD"],
      required: true
    },

    admissionSeason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admission_seasons",
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    transactionId: {
      type: String,
      required: true,
      unique: true
    },

    status: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED", "CANCELLED"],
      default: "INITIATED"
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

/* =================================================
   🔐 HARD UNIQUE RULE
   email + admissionSeason + program
================================================= */
AdmissionPaymentSchema.index(
  { email: 1, admissionSeason: 1, program: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.admission_payments ||
  mongoose.model("admission_payments", AdmissionPaymentSchema);
