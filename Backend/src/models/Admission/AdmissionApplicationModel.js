const mongoose = require("mongoose");

/* =========================================================
   ACADEMIC RECORD SCHEMA
   (SSC / HSC / BSc / BBA / LLB / MS / MBA / LLM)
========================================================= */
const AcademicRecordSchema = new mongoose.Schema({
  examLevel: {
    type: String,
    enum: ["SSC", "HSC", "BSc", "BBA", "LLB", "MS", "MBA", "LLM"],
    required: true,
    set: v => {
      if (!v) return v;
      const map = {
        SSC: "SSC",
        HSC: "HSC",
        BSC: "BSc",
        BBA: "BBA",
        LLB: "LLB",
        MS: "MS",
        MBA: "MBA",
        LLM: "LLM"
      };
      return map[v.toUpperCase()] || v;
    }
  },

  institution: {
    type: String,
    required: true
  },

  passingYear: {
    type: String,
    required: true
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

  isFinal: {
    type: Boolean,
    default: true
  }
}, { _id: false });

/* =========================================================
   COURSE-WISE GPA (FOR MS / MBA / LLM)
   → Used for auto GPA calculation
========================================================= */
const AppliedSubjectCourseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    uppercase: true
  },

  courseTitle: {
    type: String,
    required: true
  },

  creditHour: {
    type: Number,
    required: true,
    min: 0.5
  },

  gradePoint: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },

  // auto-calculated (GP × CH)
  gpXch: {
    type: Number,
    default: 0
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
   MAIN ADMISSION APPLICATION SCHEMA
========================================================= */
const AdmissionApplicationSchema = new mongoose.Schema({

  /* ================= PROGRAM INFO ================= */
  program: {
    type: String,
    enum: ["MBA", "MS", "LLM", "PhD"],
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
  academicRecords: {
    type: [AcademicRecordSchema],
    required: true
  },

  /* ================= COURSE-WISE GPA (MS / MBA / LLM) ================= */
  appliedSubjectCourses: {
    type: [AppliedSubjectCourseSchema],
    default: []
  },

  totalCreditHourBachelor: {
    type: Number,
    default: null
  },

  totalCreditHourAppliedSubject: {
    type: Number,
    default: null
  },

  // auto-calculated GPA from appliedSubjectCourses
  calculatedCGPA: {
    type: Number,
    default: null
  },

  // set by Chairman
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

  /* ================= PUBLICATIONS ================= */
  numberOfPublications: {
    type: Number,
    default: 0
  },

  publications: {
    type: [String], // URLs
    default: []
  },

  /* ================= DECLARATION ================= */
  declarationAccepted: {
    type: Boolean,
    required: true
  },

  /* ================= PAYMENT ================= */
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admission_payments",
    required: true
  },

  /* ================= DOCUMENTS ================= */
  documents: [
    {
      title: {
        type: String,
        required: true
      },
      fileUrl: {
        type: String,
        required: true
      },
      fileType: {
        type: String,
        enum: ["pdf", "jpg", "jpeg", "png"],
        required: true
      },
      fileSizeKB: {
        type: Number,
        required: true
      }
    }
  ],

  totalDocumentSizeKB: {
    type: Number,
    max: 30720 // 30 MB
  },

  /* ================= STATUS & FLOW ================= */
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
  supervisorRank: {
  type: Number,
  default: null
},

isWithinSupervisorQuota: {
  type: Boolean,
  default: false
},


  approvalLog: [ApprovalLogSchema],

  createdAt: {
    type: Date,
    default: Date.now
  }

}, { versionKey: false });

/* =========================================================
   UNIQUE CONSTRAINT
========================================================= */
AdmissionApplicationSchema.index(
  { admissionSeason: 1, program: 1, email: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.admission_applications ||
  mongoose.model("admission_applications", AdmissionApplicationSchema);
