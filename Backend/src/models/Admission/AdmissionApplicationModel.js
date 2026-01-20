const mongoose = require("mongoose");

/* =========================================================
   ACADEMIC RECORD (GENERAL – SSC / HSC / BSc / MS)
========================================================= */
const AcademicRecordSchema = new mongoose.Schema({
  examLevel: {
    type: String,
    enum: ["SSC", "HSC", "BSc", "BBA", "MS", "MBA"],
    required: true
  },

  institution: String,
  passingYear: String,

  cgpa: {
    type: Number,
    required: true
  },

  cgpaScale: {
    type: Number, // 5 for SSC/HSC, 4 for BSc/MS/MBA
    required: true
  },

  isFinal: {
    type: Boolean,
    default: false
  }
}, { _id: false });

/* =========================================================
   PSTU LAST SEMESTER COURSE RESULT (POINT-9 SOURCE)
========================================================= */
const PSTUCourseResultSchema = new mongoose.Schema({
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
    required: true
  },

  gradePoint: {
    type: Number, // 0.00 – 4.00
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

  /* ================= PROGRAM INFO ================= */
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

  /* ================= PERSONAL INFO ================= */
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

// ================= GENERAL ACADEMIC RECORDS =================
// Used for:
// SSC (out of 5)
// HSC (out of 5)
// BSc / BBA (out of 4)
// MS / MBA (out of 4) → ONLY for PhD applicants

academicRecords: [
  {
    examLevel: {
      type: String,
      enum: ["SSC", "HSC", "BSc", "BBA", "MS", "MBA"],
      required: true,
      uppercase: true
    },

    cgpa: {
      type: Number,
      required: true
    },

    cgpaScale: {
      type: Number,
      enum: [4, 5],
      required: true
    },

    // true for final result only
    isFinal: {
      type: Boolean,
      default: true
    }
  }
],

// ================= PSTU IDENTIFICATION =================
isPSTUStudent: {
  type: Boolean,
  required: true,
  default: false
},

// ================= PSTU LAST SEMESTER (POINT-9 SOURCE) =================
// ⚠️ Filled ONLY when:
// - isPSTUStudent = true
// - Program = MS or MBA
// ⚠️ Courses MUST match department courses created by Chairman

pstuLastSemesterCourses: [
  {
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

    // grade point obtained by student (0.00 – 4.00)
    gradePoint: {
      type: Number,
      min: 0,
      max: 4,
      required: true
    }
  }
],

// ================= AUTO CALCULATED CGPA =================
// Calculated from pstuLastSemesterCourses
// Formula:
// Σ(creditHour × gradePoint) / Σ(creditHour)

calculatedCGPA: {
  type: Number,
  default: null
},

// ================= FINAL POINT-9 SCORE =================
// Calculated by Chairman based on:
// - calculatedCGPA (PSTU MS/MBA)
// - OR BSc/BBA CGPA (Non-PSTU MS/MBA)
// - OR MS/MBA CGPA (PhD)

academicQualificationPoints: {
  type: Number,
  default: 0
},


  /* ================= SERVICE ================= */
  isInService: {
    type: Boolean,
    default: false
  },

  serviceInfo: {
    position: String,
    lengthOfService: String,
    natureOfJob: String,
    employer: String
  },

  /* ================= OTHER ================= */
  numberOfPublications: {
    type: Number,
    default: 0
  },
publications: {
  type: [String], // array of URLs
  default: []
}
,

  declarationAccepted: {
    type: Boolean,
    required: true
  },

  /* ================= SELECTION LOGIC ================= */
  supervisorRank: {
    type: Number,
    default: null
  },

  isWithinSupervisorQuota: {
    type: Boolean,
    default: false
  },

  selectionRound: {
    type: Number,
    default: 1
  },

  /* ================= TEMPORARY LOGIN ================= */
  temporaryLogin: {
    tempId: {
      type: String,
      unique: true,
      sparse: true
    },
    password: String,
    expiresAt: Date,
    isUsed: {
      type: Boolean,
      default: false
    }
  },

  /* ================= STATUS ================= */
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

  finalDecisionAt: Date,

  enrolledStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },

  remarks: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

}, { versionKey: false });

/* =========================================================
   CONSTRAINTS
========================================================= */
AdmissionApplicationSchema.index(
  { admissionSeason: 1, email: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.admission_applications ||
  mongoose.model("admission_applications", AdmissionApplicationSchema);
