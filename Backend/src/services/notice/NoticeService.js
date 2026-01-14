const NoticeModel =require("../../models/Notice/NoticeModel");

module.exports = async (req, NoticeModel) => {
  if (!req.user || req.user.role !== "admin") {
    return { status: "fail", data: "Unauthorized admin" };
  }

  const { title, description, expireAt, attachment } = req.body;

  if (!title || !description) {
    return { status: "fail", data: "All fields required" };
  }

  const notice = await NoticeModel.create({
    title,
    description,
    expireAt,
    attachment,
    createdBy: req.user.id
  });

  return { status: "success", data: notice };
};


// =================================================
// CREATE NOTICE
// =================================================
exports.Create = async (req) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized admin" };
    }

    const { title, description, attachment, expireAt } = req.body;

    if (!title || !description) {
      return { status: "fail", data: "All fields required" };
    }

    const notice = await NoticeModel.create({
      title,
      description,
      attachment,
      expireAt,
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
    const { id } = req.params;

    await NoticeModel.findByIdAndDelete(id);
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
// ADMIN LIST (ALL)
// =================================================
exports.AdminList = async () => {
  try {
    const data = await NoticeModel.find()
      .sort({ createdAt: -1 })
      .lean();

    return { status: "success", data };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

// =================================================
// PUBLIC LIST (LANDING PAGE)
// =================================================
exports.PublicList = async () => {
  try {
    const now = new Date();

    const data = await NoticeModel.find({
      isActive: true,
      $or: [
        { expireAt: null },
        { expireAt: { $gte: now } }
      ]
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    return { status: "success", data };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};
