const UserTenureModel =
  require("../../models/Users/UserTenureModel");

/* =================================================
   LIST ALL TENURES
   (Admin / Dean panel use)
================================================= */
exports.List = async (req, res) => {
  try {
    const { role, activeOnly } = req.query;

    /* ================= FILTER ================= */
    const query = {};

    if (role) {
      query.role = role;
    }

    if (activeOnly === "true") {
      query.endDate = null;
    }

    /* ================= FETCH ================= */
    const tenures = await UserTenureModel.find(query)
      .populate({
        path: "user",
        select: "name nameExtension email phone role"
      })
      .populate({
        path: "department",
        select: "name"
      })
      .populate({
        path: "hall",
        select: "name code"
      })
      .populate({
        path: "appointedBy",
        select: "name email"
      })
      .sort({ startDate: -1 })
      .lean();

    return res.status(200).json({
      status: "success",
      data: tenures
    });

  } catch (error) {
    console.error("UserTenure List Error:", error);
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};
