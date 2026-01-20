const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const DeanPanelListService = async (req) => {
  try {
    if (!req.user || req.user.role !== "Dean") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const applications = await AdmissionApplicationModel.find({
      applicationStatus: "ChairmanSelected"
    })
      .populate([
        { path: "department", select: "name" },
        { path: "supervisor", select: "name email" }
      ])
      .sort({ academicQualificationPoints: -1, createdAt: 1 })
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

        academicRecords: app.academicRecords,
        serviceInfo: app.serviceInfo,
        numberOfPublications: app.numberOfPublications,

        approvalLog: app.approvalLog,
        applicationStatus: app.applicationStatus,

        createdAt: app.createdAt
      }))
    };

  } catch (error) {
    console.error("DeanPanelListService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = DeanPanelListService;
