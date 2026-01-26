const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const DeanPanelListService = async (req) => {
  try {
    /* ================= AUTH ================= */
    if (!req.user || req.user.role !== "Dean") {
      return { status: "fail", data: "Unauthorized access" };
    }

    /* ================= FETCH ================= */
    const applications = await AdmissionApplicationModel.find({
      applicationStatus: "ChairmanSelected"
    })
      .populate([
        { path: "department", select: "name" },
        { path: "supervisor", select: "name email" },
        { path: "payment", select: "transactionId" },
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

    /* ================= FORMAT RESPONSE ================= */
    const data = applications.map((app, index) => {
      /* ===== FIND CHAIRMAN ===== */
      const chairmanLog = app.approvalLog
        ?.slice()
        .reverse()
        .find(log => log.role === "Chairman");

      return {
        /* ===== BASIC ===== */
        _id: app._id,
        sl: index + 1,
        applicationNo: app.applicationNo,
        applicationStatus: app.applicationStatus,

        /* ===== APPLICANT ===== */
        applicantName: app.applicantName,
        email: app.email,
        mobile: app.mobile,
        program: app.program,

        /* ===== ACADEMIC ===== */
        academicQualificationPoints:
          app.academicQualificationPoints || 0,
        supervisorRank: app.supervisorRank || null,
        academicRecords: app.academicRecords,
        calculatedCGPA: app.calculatedCGPA || null,

        /* ===== SERVICE / PUBLICATION ===== */
        isInService: app.isInService,
        serviceInfo: app.serviceInfo,
        numberOfPublications: app.numberOfPublications,
        publications: app.publications,

        /* ===== RELATIONS ===== */
        department: app.department?.name || "",
        supervisor: app.supervisor?.name || "",
        supervisorEmail: app.supervisor?.email || "",

        chairmanName:
          chairmanLog?.approvedBy?.name || "—",

        /* ===== DOCUMENTS ===== */
        documents: app.documents || [],
        totalDocumentSizeKB: app.totalDocumentSizeKB || 0,

        /* ===== APPROVAL FLOW ===== */
        approvalLog: app.approvalLog || [],

        /* ===== META ===== */
        createdAt: app.createdAt
      };
    });

    return {
      status: "success",
      data
    };

  } catch (error) {
    console.error("DeanPanelListService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = DeanPanelListService;
