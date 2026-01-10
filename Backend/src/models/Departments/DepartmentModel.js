// models/Departments/DepartmentModel.js
const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "faculties",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false });

// Prevent duplicate department names within same faculty
DepartmentSchema.index({ name: 1, faculty: 1 }, { unique: true });

const DepartmentModel = mongoose.model('departments', DepartmentSchema);
module.exports = DepartmentModel;
