const AdmissionApplicationModel =
  require('../../models/Admission/AdmissionApplicationModel');

const ChairmanPanelListService = async (req) => {
  try {
    const departmentId = req.user.department;

    const data = await AdmissionApplicationModel.find({
      department: departmentId,
      applicationStatus: "SupervisorApproved"
    })
      .populate("department supervisor", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    return { status: "success", data };

  } catch (error) {
    return { status: "fail", data: error.toString() };
  }
};

module.exports = ChairmanPanelListService;
