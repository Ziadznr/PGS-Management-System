const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const SupervisorPanelListService = async (req) => {
  try {
    /* ================= AUTH ================= */
    if (!req.user || req.user.role !== "Supervisor") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const supervisorId = req.user.id;

    /* ================= FETCH FULL APPLICATION ================= */
    const applications = await AdmissionApplicationModel.find({
      supervisor: supervisorId,
      applicationStatus: "Submitted"
    })
      .populate([
        { path: "department", select: "departmentName departmentCode" },
        { path: "supervisor", select: "name email" },
        { path: "payment", select: "transactionId amount status" },
        { path: "admissionSeason", select: "seasonName academicYear" }
      ])
      .sort({ createdAt: -1 })
      .lean();

    /* ================= RETURN FULL DATA ================= */
    return {
      status: "success",
      data: applications
    };

  } catch (error) {
    console.error("SupervisorPanelListService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = SupervisorPanelListService;
