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
      enum: ["Dean", "Chairman", "Supervisor", "Student"],
      required: true
    },

    isActive: { type: Boolean, default: true },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: function () {
        return this.role !== "Dean";
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

/* ================= DB CONSTRAINTS ================= */
UsersSchema.index(
  { email: 1, role: 1, department: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

UsersSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: "Dean", isActive: true } }
);

UsersSchema.index(
  { role: 1, department: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "Chairman", isActive: true }
  }
);

module.exports = mongoose.model("users", UsersSchema);
