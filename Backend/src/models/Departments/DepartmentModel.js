// models/Departments/DepartmentModel.js
const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

// OPTIONAL: enforce uniqueness properly
DepartmentSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("departments", DepartmentSchema);
