const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const AUTO_QUOTA = 3;
const MAX_QUOTA = 5;

/* =========================================================
   TOTAL MERIT POINT CALCULATION
========================================================= */
const calculateTotalMeritPoint = (app) => {
  let total = 0;
  const { academicRecords, program, calculatedCGPA } = app;

  const ssc = academicRecords.find(r => r.examLevel === "SSC");
  if (ssc?.cgpa) total += Number(ssc.cgpa);

  const hsc = academicRecords.find(r => r.examLevel === "HSC");
  if (hsc?.cgpa) total += Number(hsc.cgpa);

  const bachelor = academicRecords.find(r =>
    ["BSc", "BBA", "LLB"].includes(r.examLevel)
  );
  if (bachelor?.cgpa) total += Number(bachelor.cgpa);

  if (["MS", "MBA", "LLM"].includes(program) && calculatedCGPA) {
    total += Number(calculatedCGPA);
  }

  if (program === "PhD") {
    const ms = academicRecords.find(
      r =>
        ["MS", "MBA", "LLM"].includes(r.examLevel) &&
        r.isFinal
    );
    if (ms?.cgpa) total += Number(ms.cgpa);
  }

  return Number(total.toFixed(2));
};

/* =========================================================
   CHAIRMAN PANEL LIST SERVICE (FINAL & FIXED)
========================================================= */
const ChairmanPanelListService = async (req) => {
  try {
    if (!req.user || req.user.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const departmentId = req.user.department;

    /* =================================================
       LOAD ALL CHAIRMAN-RELEVANT APPLICATIONS
    ================================================= */
   const applications = await AdmissionApplicationModel.find({
  department: departmentId,
  applicationStatus: {
    $in: [
      "SupervisorApproved",
      "ChairmanWaiting"
    ]
  }
})
      .populate([
        { path: "department", select: "name" },
        { path: "supervisor", select: "name email" }
      ])
      .lean();

    /* ================= GROUP BY SUPERVISOR ================= */
    const grouped = {};
    applications.forEach(app => {
      const supId = app.supervisor?._id?.toString();
      if (!supId) return;
      if (!grouped[supId]) grouped[supId] = [];
      grouped[supId].push(app);
    });

    const finalList = [];

    /* ================= PROCESS PER SUPERVISOR ================= */
    for (const supApps of Object.values(grouped)) {

      /* ===== CALCULATE MERIT ===== */
      supApps.forEach(app => {
        app._meritPoint = calculateTotalMeritPoint(app);
      });

      /* ===== SORT BY MERIT THEN TIME ===== */
      supApps.sort((a, b) => {
        if (b._meritPoint !== a._meritPoint) {
          return b._meritPoint - a._meritPoint;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      /* ===== PREPARE RESPONSE ===== */
      supApps.forEach((app, index) => {
        const rank = index + 1;

        const isAutoSelected = rank <= AUTO_QUOTA;

        finalList.push({
          _id: app._id,
          applicationNo: app.applicationNo,

          applicantName: app.applicantName,
          email: app.email,
          mobile: app.mobile,

          program: app.program,
          department: app.department?.name,

          supervisor: {
            _id: app.supervisor?._id,
            name: app.supervisor?.name,
            email: app.supervisor?.email
          },

          academicQualificationPoints: app._meritPoint,

          // 🔥 ALWAYS TRUST RANK FOR DISPLAY
          supervisorRank: rank,

          applicationStatus: isAutoSelected
            ? "ChairmanSelected"
            : "ChairmanWaiting",

          canBeManuallyAllowed:
            !isAutoSelected &&
            rank > AUTO_QUOTA &&
            rank <= MAX_QUOTA,

          documents: app.documents,
          totalDocumentSizeKB: app.totalDocumentSizeKB,

          createdAt: app.createdAt
        });
      });
    }

    return {
      status: "success",
      data: finalList
    };

  } catch (error) {
    console.error("ChairmanPanelListService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = ChairmanPanelListService;
