const mongoose = require("mongoose");

/* =========================================================
   ACADEMIC RECORD SCHEMA (SSC / HSC / BSc / BBA / MS / MBA)
========================================================= */
const AcademicRecordSchema = new mongoose.Schema({
  examLevel: {
    type: String,
    enum: ["SSC", "HSC", "BSc", "BBA", "MS", "MBA"],
    required: true,
    set: v => {
      if (!v) return v;
      const map = {
        SSC: "SSC",
        HSC: "HSC",
        BSC: "BSc",
        BBA: "BBA",
        MS: "MS",
        MBA: "MBA"
      };
      return map[v.toUpperCase()] || v;
    }
  },

  institution: String,
  passingYear: String,

  cgpa: {
    type: Number,
    required: true
  },

  cgpaScale: {
    type: Number,
    enum: [4, 5],
    required: true
  },

  isFinal: {
    type: Boolean,
    default: true
  }
}, { _id: false });

/* =========================================================
   PSTU LAST SEMESTER COURSE RESULT
========================================================= */
const PSTUCourseResultSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    uppercase: true,
    required: true
  },

  courseTitle: {
    type: String,
    uppercase: true,
    required: true
  },

  creditHour: {
    type: Number,
    required: true
  },

  gradePoint: {
    type: Number,
    min: 0,
    max: 4,
    required: true
  }
}, { _id: false });

/* =========================================================
   APPROVAL LOG
========================================================= */
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
    enum: ["Approved", "Rejected", "Selected", "Waiting"],
    required: true
  },

  remarks: String,

  decidedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

/* =========================================================
   MAIN APPLICATION SCHEMA
========================================================= */
const AdmissionApplicationSchema = new mongoose.Schema({

  program: {
    type: String,
    enum: ["MBA", "MS", "PhD"],
    required: true
  },

  admissionSeason: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admission_seasons",
    required: true
  },

  academicYear: {
    type: String,
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

  applicantName: {
    type: String,
    required: true
  },

  fatherName: String,
  motherName: String,
  dateOfBirth: Date,
  nationality: String,

  maritalStatus: {
    type: String,
    enum: ["Married", "Single"]
  },

  sex: {
    type: String,
    enum: ["Male", "Female"]
  },

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

  mobile: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    lowercase: true
  },

  /* ================= ACADEMIC ================= */
  academicRecords: {
    type: [AcademicRecordSchema],
    required: true
  },

  isPSTUStudent: {
    type: Boolean,
    default: false,
    required: true
  },

  pstuLastSemesterCourses: {
    type: [PSTUCourseResultSchema],
    default: []
  },

  calculatedCGPA: {
    type: Number,
    default: null
  },

  academicQualificationPoints: {
    type: Number,
    default: 0
  },

  numberOfPublications: {
    type: Number,
    default: 0
  },

  publications: {
    type: [String],
    default: []
  },

  declarationAccepted: {
    type: Boolean,
    required: true
  },

  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admission_payments",
    required: true
  },

  documents: [
    {
      title: String,
      fileUrl: String,
      fileType: {
        type: String,
        enum: ["pdf", "jpg", "jpeg", "png"]
      },
      fileSizeKB: Number
    }
  ],

  totalDocumentSizeKB: {
    type: Number,
    max: 30720
  },

  applicationNo: {
    type: String,
    unique: true
  },

  applicationStatus: {
    type: String,
    enum: [
      "Submitted",
      "SupervisorApproved",
      "SupervisorRejected",
      "ChairmanSelected",
      "ChairmanWaiting",
      "DeanAccepted",
      "DeanRejected",
      "Enrolled"
    ],
    default: "Submitted"
  },

  approvalLog: [ApprovalLogSchema],

  createdAt: {
    type: Date,
    default: Date.now
  }

}, { versionKey: false });

AdmissionApplicationSchema.index(
  { admissionSeason: 1, email: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.admission_applications ||
  mongoose.model("admission_applications", AdmissionApplicationSchema);
