const mongoose = require("mongoose");

const DepartmentLastSemesterCourseSchema = new mongoose.Schema({

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "departments",
    required: true,
    unique: true   // 🔒 one course-set per department
  },

  courses: [
    {
      courseCode: {
        type: String,
        required: true
      },

      courseTitle: {
        type: String,
        required: true
      },

      creditHour: {
        type: Number,
        required: true,
        min: 0.5
      }
    }
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }

}, { versionKey: false });

module.exports =
  mongoose.models.department_last_semester_courses ||
  mongoose.model(
    "department_last_semester_courses",
    DepartmentLastSemesterCourseSchema
  );
