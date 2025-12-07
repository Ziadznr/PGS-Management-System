const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    firstName: { type: String },
    lastName: { type: String },
    mobile: { type: String },
    password: { type: String },
    photo: { type: String },

    // 👇 New Field Added
    category: {
        type: String,
        enum: ['admin', 'teacher', 'dean', 'student'],  // allowed roles
    },

    createdDate: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

const UsersModel = mongoose.model('users', DataSchema);

module.exports = UsersModel;
