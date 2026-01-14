const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    attachment: String,

    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    expireAt: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
      required: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

module.exports =
  mongoose.models.notices ||
  mongoose.model("notices", NoticeSchema);
