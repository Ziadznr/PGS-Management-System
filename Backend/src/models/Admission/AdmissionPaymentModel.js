const mongoose = require("mongoose");

const AdmissionPaymentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },

  amount: {
    type: Number,
    required: true
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

  admissionSeason: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admission_seasons",
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

}, { versionKey: false });

module.exports =
  mongoose.models.admission_payments ||
  mongoose.model("admission_payments", AdmissionPaymentSchema);
