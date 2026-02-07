const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UsersSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameExtension: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    photo: { type: String, default: "" },

    role: {
      type: String,
      enum: [
        "Dean",
        "VC",
        "Registrar",
        "PGS Specialist",
        "Provost",
        "Chairman",
        "Supervisor",
        "Student"
      ],
      required: true
    },

    isActive: { type: Boolean, default: true },

    /* ================= CONTEXT ================= */

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: function () {
        return ["Chairman", "Supervisor", "Student"].includes(this.role);
      }
    },

    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "halls",
      required: function () {
        return this.role === "Provost";
      }
    },

    subject: {
      type: String,
      default: null,
      required: function () {
        return this.role === "Supervisor";
      }
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      default: null
    },

    isSelfRegistered: { type: Boolean, default: false },
    isEnrolled: { type: Boolean, default: false },
    isFirstLogin: { type: Boolean, default: true },

    passwordResetToken: String,
    passwordResetExpires: Date,

    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

/* ================= PASSWORD HASH ================= */
UsersSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

/* =================================================
   🔐 UNIQUE ROLE CONSTRAINTS
================================================= */

/* 🔒 ONLY ONE VC */
UsersSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: "VC",
      isActive: true
    }
  }
);

/* 🔒 ONLY ONE Registrar */
UsersSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: "Registrar",
      isActive: true
    }
  }
);

/* 🔒 ONLY ONE PGS Specialist */
UsersSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: "PGS Specialist",
      isActive: true
    }
  }
);

/* 🔒 ONLY ONE Dean (SYSTEM-WIDE) */
UsersSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: "Dean",
      isActive: true
    }
  }
);

/* 🔒 ONE Provost PER HALL */
UsersSchema.index(
  { role: 1, hall: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: "Provost",
      isActive: true
    }
  }
);

/* 🔒 ONE Chairman PER DEPARTMENT */
UsersSchema.index(
  { role: 1, department: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: "Chairman",
      isActive: true
    }
  }
);

/* 🔒 Email uniqueness per role + context */
UsersSchema.index(
  { email: 1, role: 1, department: 1, hall: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

module.exports = mongoose.model("users", UsersSchema);
