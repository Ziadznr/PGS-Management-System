const mongoose = require("mongoose");

const UserTenureSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },

    /* ================= ROLE ================= */
    role: {
      type: String,
      enum: [
        "Dean",
        "VC",
        "Registrar",
        "PGS Specialist",
        "Chairman",
        "Provost"
      ],
      required: true
    },

    /* ================= CONTEXT ================= */
    // Used only when role === "Chairman"
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      default: null
    },

    // Used only when role === "Provost"
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "halls",
      default: null
    },

    /* ================= SNAPSHOT (IMMUTABLE) ================= */
    nameSnapshot: {
      type: String,
      required: true
    },

    emailSnapshot: {
      type: String,
      required: true
    },

    /* ================= TENURE DURATION ================= */
    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      default: null // active tenure
    },

    /* ================= META ================= */
    appointedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true
    },

    remarks: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* =================================================
   INDEXES (IMPORTANT)
================================================= */

// Fast lookup of active tenure
UserTenureSchema.index(
  { user: 1, endDate: 1 }
);

// Role-based history queries
UserTenureSchema.index(
  { role: 1, startDate: -1 }
);

// Context-specific history
UserTenureSchema.index(
  { role: 1, department: 1 }
);

UserTenureSchema.index(
  { role: 1, hall: 1 }
);

module.exports = mongoose.model("user_tenures", UserTenureSchema);
