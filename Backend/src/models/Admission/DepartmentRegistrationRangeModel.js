const mongoose = require("mongoose");

const DepartmentRegistrationRangeSchema = new mongoose.Schema({

    admissionSeason: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admission_seasons",
        required: true
    },

    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "departments",
        required: true
    },
      subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },

  subjectName: {
    type: String,
    default: null
  },

    startRegNo: {
        type: Number,
        required: true
    },

    endRegNo: {
        type: Number,
        required: true
    },

    currentRegNo: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return v >= this.startRegNo && v <= this.endRegNo;
            },
            message: "currentRegNo must be within startRegNo and endRegNo"
        }
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

}, { versionKey: false });


// 🔒 One department can have only ONE range per season
DepartmentRegistrationRangeSchema.index(
  { admissionSeason: 1, department: 1, subjectId: 1 },
  { unique: true }
);

module.exports =
    mongoose.models.department_reg_ranges ||
    mongoose.model("department_reg_ranges", DepartmentRegistrationRangeSchema);
