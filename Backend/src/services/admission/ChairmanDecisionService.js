const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const SendEmailUtility =
  require("../../utility/SendEmailUtility");
const UsersModel =
  require("../../models/Users/UsersModel");

const MAX_PER_SUPERVISOR = 10;

/* =========================================================
   TOTAL MERIT POINT CALCULATOR (PURE CGPA SUM)
   Merit = SSC + HSC + Bachelor + Calculated CGPA (if applicable)
========================================================= */
const calculateTotalMeritPoint = (application) => {
  let total = 0;

  const { academicRecords, program, calculatedCGPA } = application;

  // SSC
  const ssc = academicRecords.find(r => r.examLevel === "SSC");
  if (ssc) total += Number(ssc.cgpa);

  // HSC
  const hsc = academicRecords.find(r => r.examLevel === "HSC");
  if (hsc) total += Number(hsc.cgpa);

  // Bachelor (BSc / BBA / LLB)
  const bachelor = academicRecords.find(r =>
    ["BSc", "BBA", "LLB"].includes(r.examLevel)
  );
  if (bachelor) total += Number(bachelor.cgpa);

  // MS / MBA / LLM → calculated CGPA
  if (["MS", "MBA", "LLM"].includes(program) && calculatedCGPA) {
    total += Number(calculatedCGPA);
  }

  return Number(total.toFixed(2)); // clean merit value
};

/* =========================================================
   CHAIRMAN DECISION SERVICE
========================================================= */
const ChairmanDecisionService = async (req) => {
  try {
    const chairmanSession = req.user;

    if (!chairmanSession || chairmanSession.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const chairmanId = chairmanSession?.id?.toString();

    if (!chairmanId) {
      return { status: "fail", data: "Chairman ID missing from session" };
    }

    /* ================= LOAD CHAIRMAN SNAPSHOT ================= */
    const chairman = await UsersModel
      .findById(chairmanId)
      .select("name email role department");

    if (!chairman) {
      return { status: "fail", data: "Chairman account not found" };
    }

    /* ================= FETCH SUPERVISOR-APPROVED ================= */
    const applications = await AdmissionApplicationModel.find({
      department: chairman.department,
      applicationStatus: "SupervisorApproved"
    }).populate("supervisor", "name email");

    if (!applications.length) {
      return { status: "fail", data: "No applications pending" };
    }

    /* ================= GROUP BY SUPERVISOR ================= */
    const grouped = {};
    for (const app of applications) {
      const supId = app.supervisor._id.toString();
      if (!grouped[supId]) grouped[supId] = [];
      grouped[supId].push(app);
    }

    /* ================= PROCESS PER SUPERVISOR ================= */
    for (const supervisorId in grouped) {
      const list = grouped[supervisorId];

      /* ===== Calculate merit ===== */
      list.forEach(app => {
        app.academicQualificationPoints =
          calculateTotalMeritPoint(app);
      });

      /* ===== Sort by merit (desc), then submission time ===== */
      list.sort((a, b) => {
        if (b.academicQualificationPoints !== a.academicQualificationPoints) {
          return b.academicQualificationPoints - a.academicQualificationPoints;
        }
        return a.createdAt - b.createdAt;
      });

      /* ===== Select / Waiting ===== */
      for (let i = 0; i < list.length; i++) {
        const app = list[i];
        const selected = i < MAX_PER_SUPERVISOR;

        app.applicationStatus = selected
          ? "ChairmanSelected"
          : "ChairmanWaiting";

        app.supervisorRank = i + 1;
        app.isWithinSupervisorQuota = selected;

        /* ================= APPROVAL LOG ================= */
        app.approvalLog.push({
          role: "Chairman",

          approvedBy: chairman._id,
          approvedByName: chairman.name,
          approvedByEmail: chairman.email,
          approvedByRoleAtThatTime: chairman.role,

          decision: selected ? "Selected" : "Waiting",
          remarks: `Rank ${i + 1} | Merit Point ${app.academicQualificationPoints}`,
          decidedAt: new Date()
        });

        await app.save();

        /* ================= EMAIL ================= */
        const subject = selected
          ? "PGS Application Selected (Merit Based)"
          : "PGS Application – Waiting List";

        const message = selected
          ? `
Dear ${app.applicantName},

You have been SELECTED based on academic merit.

Supervisor: ${app.supervisor.name}
Merit Rank : ${i + 1}
Merit Point: ${app.academicQualificationPoints}

Your application will now be reviewed by the Dean.

Regards,
PGS Admission Office
          `
          : `
Dear ${app.applicantName},

Your application is currently on the WAITING LIST
based on academic merit.

Merit Rank : ${i + 1}
Merit Point: ${app.academicQualificationPoints}

You will be notified if a seat becomes available.

Regards,
PGS Admission Office
          `;

        await SendEmailUtility(app.email, message, subject);
      }
    }

    return {
      status: "success",
      data: "Chairman academic merit processing completed"
    };

  } catch (error) {
    console.error("ChairmanDecisionService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = ChairmanDecisionService;
