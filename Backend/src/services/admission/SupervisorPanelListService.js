const AdmissionApplicationModel =
  require('../../models/Admission/AdmissionApplicationModel');

const SupervisorPanelListService = async (req) => {
  try {
    const supervisorId = req.user._id;

    const data = await AdmissionApplicationModel.find({
      supervisor: supervisorId,
      applicationStatus: "Submitted"
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

module.exports = SupervisorPanelListService;
