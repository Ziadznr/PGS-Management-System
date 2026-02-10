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
        { path: "department", select: "departmentName departmentCode" },
        { path: "supervisor", select: "name nameExtension email" },
        { path: "payment", select: "transactionId amount status" },
        { path: "admissionSeason", select: "academicYear" },
        {
          path: "approvalLog.approvedBy",
          select: "name nameExtension role"
        }
      ])
      .sort({
        academicQualificationPoints: -1,
        createdAt: 1
      })
      .lean();

    const data = applications.map((app, index) => {
      const chairmanLog = app.approvalLog
  ?.slice()
  .reverse()
  .find(log => log.role === "Chairman");

const chairmanUser = chairmanLog?.approvedBy;


      return {
        /* ================= TABLE FIELDS ================= */
        _id: app._id,
        sl: index + 1,
        applicationNo: app.applicationNo,
        applicantName: app.applicantName,
        program: app.program,

        departmentName: app.department?.departmentName || "",
        departmentCode: app.department?.departmentCode || "",
        supervisorName: app.supervisor?.name || "",
        supervisorNameExtension: app.supervisor?.nameExtension || "",
        supervisorEmail: app.supervisor?.email || "",

  chairmanName: chairmanUser?.name || "—",
  chairmanNameExtension: chairmanUser?.nameExtension || "",

        mobile: app.mobile,
        academicQualificationPoints: app.academicQualificationPoints || 0,
        supervisorRank: app.supervisorRank,
        applicationStatus: app.applicationStatus,

        /* ================= FULL OBJECT FOR MODAL ================= */
        fullApplication: app
      };
    });

    return { status: "success", data };

  } catch (error) {
    console.error("DeanPanelListService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = DeanPanelListService;
