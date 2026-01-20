const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const SupervisorPanelListService = async (req) => {
  try {
    // ================= 1️⃣ AUTH CHECK =================
    if (!req.user || req.user.role !== "Supervisor") {
      return {
        status: "fail",
        data: "Unauthorized access"
      };
    }

    const supervisorId = req.user.id;

    // ================= 2️⃣ FETCH APPLICATIONS =================
    const applications = await AdmissionApplicationModel.find({
      supervisor: supervisorId,
      applicationStatus: "Submitted"
    })
      .populate([
        { path: "department", select: "name" },
        { path: "supervisor", select: "name email" }
      ])
      .sort({ createdAt: -1 })
      .lean();

    // ================= 3️⃣ RESPONSE =================
    return {
      status: "success",
      data: applications.map(app => ({
        _id: app._id,
        applicationNo: app.applicationNo,
        program: app.program,
        applicantName: app.applicantName,
        email: app.email,
        mobile: app.mobile,

        department: app.department?.name || "",
        supervisor: app.supervisor?.name || "",

        academicRecords: app.academicRecords,
        admittedSubjectGPA: app.admittedSubjectGPA,

        isInService: app.isInService,
        serviceInfo: app.serviceInfo,

        numberOfPublications: app.numberOfPublications,
        applicationStatus: app.applicationStatus,

        createdAt: app.createdAt
      }))
    };

  } catch (error) {
    console.error("SupervisorPanelListService Error:", error);
    return {
      status: "fail",
      data: error.message
    };
  }
};

module.exports = SupervisorPanelListService;
