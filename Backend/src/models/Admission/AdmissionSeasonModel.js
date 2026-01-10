const mongoose = require("mongoose");

const AdmissionSeasonSchema = new mongoose.Schema({

    seasonName: {
        type: String,
        enum: ["Winter", "Summer"],
        required: true
    },

    academicYear: {
        type: String, // "2026-2027"
        required: true
    },

    applicationStartDate: {
        type: Date,
        required: true
    },

    applicationEndDate: {
        type: Date,
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

}, { versionKey: false });

// 🔒 Prevent duplicate sessions
AdmissionSeasonSchema.index(
    { seasonName: 1, academicYear: 1 },
    { unique: true }
);

module.exports =
    mongoose.models.admission_seasons ||
    mongoose.model("admission_seasons", AdmissionSeasonSchema);
