const mongoose = require("mongoose");

// ---------------- Academic Record ----------------
const AcademicRecordSchema = new mongoose.Schema({
    examName: String,
    passingYear: String,
    institution: String,
    divisionOrCGPA: String,
    marksOrGPA: String,
    percentage: String,
    pointsObtained: String
}, { _id: false });

// ---------------- Approval Log ----------------
const ApprovalLogSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["Supervisor", "Chairman", "Dean"],
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    decision: {
        type: String,
        enum: ["Approved", "Rejected"],
        required: true
    },
    remarks: String,
    decidedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

// ---------------- Main Schema ----------------
const AdmissionApplicationSchema = new mongoose.Schema({

    // ========= PROGRAM INFO =========
    program: {
        type: String,
        enum: ["MBA", "MS", "PhD"],
        required: true
    },

    semester: {
        type: String,
        enum: ["January-June", "July-December"],
        required: true
    },

    academicYear: {
        type: String,
        required: true
    },

    admissionSeason: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admission_seasons",
        required: true
    },

    // Faculty fixed = PGS (set by backend)
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "faculties",
        required: true
    },

    // Student applies directly to department
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

    // ========= PERSONAL INFO =========
    applicantName: { type: String, required: true },
    fatherName: String,
    motherName: String,
    dateOfBirth: Date,
    nationality: String,

    maritalStatus: { type: String, enum: ["Married", "Single"] },
    sex: { type: String, enum: ["Male", "Female"] },

    permanentAddress: {
        village: String,
        postOffice: String,
        postalCode: String,
        subDistrict: String,
        district: String
    },

    presentAddress: {
        village: String,
        postOffice: String,
        postalCode: String,
        subDistrict: String,
        district: String
    },

    mobile: String,
    email: String,

    // ========= ACADEMIC =========
    academicRecords: [AcademicRecordSchema],
    admittedSubjectGPA: String,

    // ========= SERVICE =========
    isInService: { type: Boolean, default: false },
    serviceInfo: {
        position: String,
        lengthOfService: String,
        natureOfJob: String,
        employer: String
    },

    numberOfPublications: Number,
    previousPSTURegistrationNo: String,

    declarationAccepted: { type: Boolean, required: true },

    // ========= STATUS =========
    applicationNo: { type: String, unique: true },

    applicationStatus: {
        type: String,
        enum: [
            "Submitted",
            "SupervisorApproved",
            "SupervisorRejected",
            "ChairmanApproved",
            "ChairmanRejected",
            "DeanApproved",
            "DeanRejected",
            "Enrolled"
        ],
        default: "Submitted"
    },

    approvalLog: [ApprovalLogSchema],

    // ========= ENROLLMENT =========
    enrollmentStatus: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending"
    },

    enrolledStudent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },

    remarks: String,
    createdAt: { type: Date, default: Date.now }

}, { versionKey: false });

// 🔒 One application per season per email
AdmissionApplicationSchema.index(
    { admissionSeason: 1, email: 1 },
    { unique: true }
);

module.exports =
    mongoose.models.admission_applications ||
    mongoose.model("admission_applications", AdmissionApplicationSchema);
