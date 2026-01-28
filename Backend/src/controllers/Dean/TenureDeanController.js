const UserTenureModel =
  require("../../models/Users/UserTenureModel");

exports.ListChairman = async (req, res) => {
  try {
    const tenures = await UserTenureModel.find({
      role: "Chairman"
    })
      .populate("user", "name email")
      .populate("department", "name")
      .sort({ startDate: -1 })
      .lean();

    res.json({ status: "success", data: tenures });

  } catch (err) {
    res.status(500).json({ status: "fail", data: err.message });
  }
};
