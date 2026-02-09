const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const DepartmentSchema = new mongoose.Schema(
  {
    program: {
      type: String,
      required: true,
      enum: ["MS", "MBA", "PhD", "LLM", "MPhil"], // allowed programs
      trim: true
    },

    departmentName: {
      type: String,
      required: true,
      trim: true
    },

    departmentCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    offeredSubjects: [SubjectSchema],

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

/**
 * Prevent duplicate departments under the same program
 * Example: MS + CCE should be unique
 */
DepartmentSchema.index(
  { program: 1, departmentCode: 1 },
  { unique: true }
);

module.exports = mongoose.model("departments", DepartmentSchema);
