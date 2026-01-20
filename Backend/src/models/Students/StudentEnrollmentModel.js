const mongoose = require("mongoose");

const StudentEnrollmentSchema = new mongoose.Schema(
  {
    // ================= APPLICATION LINK =================
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admission_applications",
      required: true,
      unique: true   // 🔒 one enrollment per application
    },

    // ================= CREATED USER =================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },

    // ================= ACADEMIC CONTEXT =================
    admissionSeason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admission_seasons",
      required: true
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: true
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },

    // ================= IDENTIFIERS =================
    registrationNumber: {
      type: Number,
      required: true,
      unique: true
    },

    studentId: {
      type: String,
      required: true,
      unique: true
    },

    // ================= STATUS =================
    enrollmentStatus: {
      type: String,
      enum: ["Completed", "Cancelled"],
      default: "Completed"
    },

    enrolledAt: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

module.exports =
  mongoose.models.student_enrollments ||
  mongoose.model("student_enrollments", StudentEnrollmentSchema);
