const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const DeanPanelListService = async () => {
  try {
    const data = await AdmissionApplicationModel.find({
      applicationStatus: "ChairmanApproved"
    })
      .populate("department", "name")
      .populate("supervisor", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return { status: "success", data };

  } catch (error) {
    return { status: "fail", data: error.toString() };
  }
};

module.exports = DeanPanelListService;
