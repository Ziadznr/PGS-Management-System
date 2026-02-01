const mongoose = require("mongoose");

const DataSchema = mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    mobile: { type: String },
    password: { type: String, required: true },
    photo: { type: String },

    // ✅ CRITICAL FIX
    role: {
      type: String,
      default: "admin",
      enum: ["admin", "superadmin"]
    },

    createdDate: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

DataSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "admin" }
  }
);

const AdminModel = mongoose.model("admins", DataSchema);
module.exports = AdminModel;
