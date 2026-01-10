// models/Faculties/FacultyModel.js
const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false });

const FacultyModel = mongoose.model('faculties', FacultySchema);
module.exports = FacultyModel;
