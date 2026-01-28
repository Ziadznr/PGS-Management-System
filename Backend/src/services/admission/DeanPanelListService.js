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
        { path: "supervisor", select: "name email" },
        { path: "payment", select: "transactionId amount status" },
        { path: "admissionSeason", select: "academicYear" },
        {
          path: "approvalLog.approvedBy",
          select: "name role"
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

      return {
        /* ================= TABLE FIELDS ================= */
        _id: app._id,
        sl: index + 1,
        applicationNo: app.applicationNo,
        applicantName: app.applicantName,
        program: app.program,

        departmentName: app.department?.name || "",
        supervisorName: app.supervisor?.name || "",
        supervisorEmail: app.supervisor?.email || "",

        chairmanName: chairmanLog?.approvedByName || "—",

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
