const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const ChairmanPanelListService = async (req) => {
  try {
    if (!req.user || req.user.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const departmentId = req.user.department;

    const applications = await AdmissionApplicationModel.find({
      department: departmentId,
      applicationStatus: { $in: ["ChairmanSelected", "ChairmanWaiting"] }
    })
      .populate([
        { path: "department", select: "name" },
        { path: "supervisor", select: "name email" }
      ])
      .sort({ supervisorRank: 1, createdAt: 1 })
      .lean();

    return {
      status: "success",
      data: applications.map(app => ({
        _id: app._id,
        applicationNo: app.applicationNo,

        applicantName: app.applicantName,
        email: app.email,
        mobile: app.mobile,

        program: app.program,
        department: app.department?.name,
        supervisor: app.supervisor?.name,

        academicQualificationPoints: app.academicQualificationPoints,
        supervisorRank: app.supervisorRank,
        isWithinSupervisorQuota: app.isWithinSupervisorQuota,

        applicationStatus: app.applicationStatus,
        createdAt: app.createdAt
      }))
    };

  } catch (error) {
    console.error("ChairmanPanelListService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = ChairmanPanelListService;
