const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UsersSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      trim: true
    },

    nameExtension: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    photo: {
      type: String,
      default: ""
    },

    /* ================= ROLE ================= */
    role: {
      type: String,
      enum: ["Dean", "Chairman", "Supervisor", "Student"],
      required: true
    },

    /* ================= STATUS & TENURE ================= */
    isActive: {
      type: Boolean,
      default: true
    },

    deactivatedAt: {
      type: Date,
      default: null
    },

    tenure: {
      startDate: {
        type: Date,
        default: Date.now
      },
      endDate: {
        type: Date,
        default: null
      }
    },

    /* ================= DEPARTMENT ================= */
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: function () {
        return this.role !== "Dean";
      }
    },

    /* ================= SUBJECT (SUPERVISOR ONLY) ================= */
    subject: {
      type: String,
      default: null
    },

    /* ================= ACCOUNT ORIGIN ================= */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null
    },

    isSelfRegistered: {
      type: Boolean,
      default: false
    },

    isEnrolled: {
      type: Boolean,
      default: false
    },

    /* ================= SECURITY ================= */
    isFirstLogin: {
      type: Boolean,
      default: true
    },

    passwordResetToken: String,
    passwordResetExpires: Date,

    /* ================= META ================= */
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

/* ================= PASSWORD HASH ================= */
UsersSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("users", UsersSchema);
