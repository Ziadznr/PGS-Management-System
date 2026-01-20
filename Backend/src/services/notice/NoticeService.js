const NoticeModel = require("../../models/Notice/NoticeModel");

// =================================================
// CREATE NOTICE
// =================================================
exports.Create = async (req) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const {
      title,
      description,
      attachment,
      expireAt,
      isPublic   // ✅ READ IT
    } = req.body;

    if (!title || !description) {
      return { status: "fail", data: "All fields required" };
    }

    const notice = await NoticeModel.create({
      title,
      description,
      attachment,
      expireAt,
      isPublic: Boolean(isPublic), // ✅ FIX
      createdBy: req.user.id
    });

    return { status: "success", data: notice };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};


// =================================================
// UPDATE NOTICE
// =================================================
exports.Update = async (req) => {
  try {
    const { id } = req.params;

    const notice = await NoticeModel.findById(id);
    if (!notice) {
      return { status: "fail", data: "Notice not found" };
    }

    if (notice.isLocked) {
      return { status: "fail", data: "Notice is locked" };
    }

    await NoticeModel.updateOne({ _id: id }, req.body);
    return { status: "success", data: "Notice updated" };
  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

// =================================================
// DELETE NOTICE
// =================================================
exports.Delete = async (req) => {
  try {
    await NoticeModel.findByIdAndDelete(req.params.id);
    return { status: "success", data: "Notice deleted" };
  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

// =================================================
// PIN / UNPIN NOTICE
// =================================================
exports.TogglePin = async (req) => {
  try {
    const notice = await NoticeModel.findById(req.params.id);
    if (!notice) return { status: "fail", data: "Notice not found" };

    notice.isPinned = !notice.isPinned;
    await notice.save();

    return {
      status: "success",
      data: notice.isPinned ? "Notice pinned" : "Notice unpinned"
    };
  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

// =================================================
// LOCK / UNLOCK NOTICE
// =================================================
exports.ToggleLock = async (req) => {
  try {
    const notice = await NoticeModel.findById(req.params.id);
    if (!notice) return { status: "fail", data: "Notice not found" };

    notice.isLocked = !notice.isLocked;
    await notice.save();

    return {
      status: "success",
      data: notice.isLocked ? "Notice locked" : "Notice unlocked"
    };
  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

// =================================================
// ADMIN LIST
// =================================================
exports.AdminList = async () => {
  try {
    const data = await NoticeModel.find().sort({ createdAt: -1 }).lean();
    return { status: "success", data };
  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

// =================================================
// PUBLIC LIST
// =================================================
exports.PublicList = async () => {
  try {
    const now = new Date();

    const data = await NoticeModel.find({
      isPublic: true,
      isActive: true,
      $or: [{ expireAt: null }, { expireAt: { $gte: now } }]
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    return { status: "success", data };
  } catch (error) {
    return { status: "fail", data: error.message };
  }
};


// =================================================
// PUBLIC LATEST (for landing slider)
// =================================================
exports.PublicLatest = async () => {
  try {
    const now = new Date();

    const data = await NoticeModel.findOne({
      isPublic: true,
      isActive: true,
      $or: [{ expireAt: null }, { expireAt: { $gte: now } }]
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    return { status: "success", data };
  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

