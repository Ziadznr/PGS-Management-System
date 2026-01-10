const mongoose = require("mongoose");

const StudentEnrollmentSchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admission_applications",
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },

    admissionSeason: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admission_seasons",
        required: true
    },

    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "faculties",
        required: true
    },

    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "departments",
        required: true
    },

    registrationNumber: {
        type: Number,
        unique: true,
        sparse: true
    },

    studentId: {
        type: String,
        unique: true,
        sparse: true
    },

    enrollmentStatus: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending"
    },

    enrolledAt: {
        type: Date
    }
}, { versionKey: false });

// 🔒 One enrollment per application
StudentEnrollmentSchema.index(
    { application: 1 },
    { unique: true }
);

module.exports =
    mongoose.models.student_enrollments ||
    mongoose.model("student_enrollments", StudentEnrollmentSchema);
