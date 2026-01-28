const UserTenureModel =
  require("../../models/Users/UserTenureModel");

exports.List = async (req, res) => {
  try {
    const tenures = await UserTenureModel.find()
      .populate("user", "name email")
      .populate("department", "name")
      .populate("appointedBy", "name email")
      .sort({ startDate: -1 })
      .lean();

    res.json({ status: "success", data: tenures });

  } catch (err) {
    res.status(500).json({ status: "fail", data: err.message });
  }
};
