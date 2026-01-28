const mongoose = require("mongoose");

const UserTenureSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },

    role: {
      type: String,
      enum: ["Dean", "Chairman"],
      required: true
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      default: null // Dean = null
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      default: null
    },

    appointedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true
    },

    remarks: String
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("user_tenures", UserTenureSchema);
