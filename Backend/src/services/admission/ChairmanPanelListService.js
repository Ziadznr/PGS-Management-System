const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const MAX_PER_SUPERVISOR = 10;

/* =========================================================
   NORMALIZE CGPA TO SCALE-4
========================================================= */
const normalizeCGPA = (cgpa, scale) => {
  if (!cgpa || !scale) return 0;
  return scale === 5 ? (cgpa / 5) * 4 : cgpa;
};

/* =========================================================
   POINT-9 SCORING
========================================================= */
const scoreFromCGPA = (cgpa4) => {
  if (cgpa4 >= 3.75) return 10;
  if (cgpa4 >= 3.5) return 9;
  if (cgpa4 >= 3.25) return 8;
  if (cgpa4 >= 3.0) return 7;
  if (cgpa4 >= 2.75) return 6;
  return 5;
};

/* =========================================================
   TOTAL MERIT POINT CALCULATION
========================================================= */
const calculateTotalMeritPoint = (app) => {
  let total = 0;

  const { academicRecords, program, calculatedCGPA } = app;

  const ssc = academicRecords.find(r => r.examLevel === "SSC");
  if (ssc) total += scoreFromCGPA(normalizeCGPA(ssc.cgpa, ssc.cgpaScale));

  const hsc = academicRecords.find(r => r.examLevel === "HSC");
  if (hsc) total += scoreFromCGPA(normalizeCGPA(hsc.cgpa, hsc.cgpaScale));

  const bachelor = academicRecords.find(r =>
    ["BSc", "BBA", "LLB"].includes(r.examLevel)
  );
  if (bachelor) {
    total += scoreFromCGPA(
      normalizeCGPA(bachelor.cgpa, bachelor.cgpaScale)
    );
  }

  // MS / MBA / LLM
  if (["MS", "MBA", "LLM"].includes(program) && calculatedCGPA) {
    total += scoreFromCGPA(calculatedCGPA);
  }

  // PhD → MS/MBA/LLM final
  if (program === "PhD") {
    const ms = academicRecords.find(r =>
      ["MS", "MBA", "LLM"].includes(r.examLevel) && r.isFinal
    );
    if (ms) {
      total += scoreFromCGPA(
        normalizeCGPA(ms.cgpa, ms.cgpaScale)
      );
    }
  }

  return total;
};

/* =========================================================
   CHAIRMAN PANEL LIST SERVICE
========================================================= */
const ChairmanPanelListService = async (req) => {
  try {
    if (!req.user || req.user.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const departmentId = req.user.department;

    /* ================= LOAD SUPERVISOR-APPROVED ================= */
    const applications = await AdmissionApplicationModel.find({
      department: departmentId,
      applicationStatus: "SupervisorApproved"
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
      supApps.forEach(app => {
        app._meritPoint = calculateTotalMeritPoint(app);
      });

      supApps.sort((a, b) => {
        if (b._meritPoint !== a._meritPoint) {
          return b._meritPoint - a._meritPoint;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      supApps.forEach((app, index) => {
        finalList.push({
          _id: app._id,
          applicationNo: app.applicationNo,

          applicantName: app.applicantName,
          email: app.email,
          mobile: app.mobile,

          program: app.program,
          department: app.department?.name,
          supervisor: app.supervisor?.name,

          academicQualificationPoints: app._meritPoint,
          supervisorRank: index + 1,
          isWithinSupervisorQuota: index < MAX_PER_SUPERVISOR,

          previewStatus:
            index < MAX_PER_SUPERVISOR
              ? "ChairmanSelected"
              : "ChairmanWaiting",

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
