const mongoose = require("mongoose");

const TemporaryEnrollmentAuthSchema = new mongoose.Schema(
  {
    application: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "admission_applications",
  required: true,
  unique: true
}
,

    loginId: {
      type: String, // mobile or email
      required: true,
      unique: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    },

    isUsed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model(
  "temporary_enrollment_auths",
  TemporaryEnrollmentAuthSchema
);
