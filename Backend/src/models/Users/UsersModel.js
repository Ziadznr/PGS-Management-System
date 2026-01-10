const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsersSchema = new mongoose.Schema({

    // Basic profile
    name: { type: String, required: true },
    phone: { type: String, required: true },

    // Login credentials
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },

    password: { type: String, required: true },

    photo: { type: String, default: "" },

    // 🔑 ROLE (Teacher = Supervisor)
    role: {
        type: String,
        enum: ["Dean", "Chairman", "Supervisor", "Student"],
        required: true
    },

    // 🏫 Department (required for all except Dean)
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "departments",
        required: function () {
            return this.role !== "Dean";
        }
    },

    createdAt: { type: Date, default: Date.now }

}, { versionKey: false });


// 🔒 Hash password before save
UsersSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const UsersModel = mongoose.model("users", UsersSchema);
module.exports = UsersModel;
