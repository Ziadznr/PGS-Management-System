// models/Departments/DepartmentModel.js
const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    offeredSubjects: [
      {
        name: { type: String, required: true },
        isActive: { type: Boolean, default: true }
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

DepartmentSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("departments", DepartmentSchema);
