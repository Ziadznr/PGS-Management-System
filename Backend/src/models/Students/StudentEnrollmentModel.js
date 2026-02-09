const mongoose = require("mongoose");

const StudentEnrollmentSchema = new mongoose.Schema(
  {
    /* ================= CORE LINKS ================= */
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admission_applications",
      required: true,
      unique: true
    },

    applicationNo: {
      type: String,
      required: true
    },

    /* ================= PROGRAM INFO ================= */
    program: {
      type: String,
      enum: ["MS", "MPhil", "PhD", "MBA", "LLM"],
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

    subject: {
      type: String,
      default: null
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },

    supervisorNameSnapshot: {
      type: String,
      required: true
    },

    /* ================= APPLICANT BIO ================= */
    applicantName: {
      type: String,
      required: true
    },

    fatherName: {
      type: String,
      required: true
    },

    motherName: {
      type: String,
      required: true
    },

    dateOfBirth: {
      type: Date,
      required: true
    },

    ageAtEnrollment: {
      type: Number,
      required: true
    },

    sex: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true
    },

    maritalStatus: {
      type: String,
      required: true
    },

    nationality: {
      type: String,
      required: true
    },

    /* ================= 🆕 NEW REQUIRED FIELD ================= */
    religion: {
      type: String,
      required: true
    },

    /* ================= CONTACT ================= */
    email: {
      type: String,
      required: true
    },

    mobile: {
      type: String,
      required: true
    },

    /* ================= 🆕 OPTIONAL ADDITIONS ================= */
    pstuRegistrationNo: {
      type: String,
      default: ""
    },

    fatherMobile: {
      type: String,
      default: ""
    },

    motherMobile: {
      type: String,
      default: ""
    },

    /* ================= ADDRESS ================= */
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

    /* ================= 🆕 LOCAL GUARDIAN ================= */
    localGuardian: {
      name: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      mobile: {
        type: String,
        required: true
      }
    },

    /* ================= ACADEMIC ================= */
    academicRecords: [
      {
        examLevel: String,
        institution: String,
        passingYear: String,
        cgpa: Number,
        cgpaScale: Number,
        isFinal: Boolean
      }
    ],

    calculatedCGPA: Number,
    totalCreditHourBachelor: Number,

    /* ================= STATUS ================= */
    enrollmentStatus: {
      type: String,
      enum: ["Draft", "Submitted", "Confirmed"],
      default: "Draft"
    },

    enrolledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("enrollments", StudentEnrollmentSchema);
