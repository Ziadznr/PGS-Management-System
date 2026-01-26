const mongoose = require("mongoose");

/*
  Temporary document storage
  Used ONLY before final application submit
  Auto-expires after 24 hours
*/

const TempUploadSchema = new mongoose.Schema(
  {
    tempId: {
      type: String,
      required: true,
      unique: true
    },

    documents: [
      {
        title: {
          type: String,
          required: true
        },
        fileUrl: {
          type: String,
          required: true
        },
        fileType: {
          type: String,
          enum: ["pdf", "jpg", "jpeg", "png"],
          required: true
        },
        fileSizeKB: {
          type: Number,
          required: true
        }
      }
    ],

    totalSizeKB: {
      type: Number,
      default: 0
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 // ⏱ auto delete after 24 hours
    }
  },
  { versionKey: false }
);

module.exports =
  mongoose.models.temp_uploads ||
  mongoose.model("temp_uploads", TempUploadSchema);
