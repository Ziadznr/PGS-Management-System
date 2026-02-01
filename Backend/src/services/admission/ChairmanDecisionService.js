const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const SendEmailUtility =
  require("../../utility/SendEmailUtility");
const UsersModel =
  require("../../models/Users/UsersModel");

const AUTO_QUOTA = 3;
const MAX_QUOTA = 5;

/* =========================================================
   TOTAL MERIT POINT CALCULATOR
========================================================= */
const calculateTotalMeritPoint = (application) => {
  let total = 0;
  const { academicRecords, program, calculatedCGPA } = application;

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

  return Number(total.toFixed(2));
};

/* =========================================================
   CHAIRMAN DECISION SERVICE (FINAL & SAFE)
========================================================= */
const ChairmanDecisionService = async (req) => {
  try {
    /* ================= AUTH ================= */
    if (!req.user || req.user.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const chairman = await UsersModel.findById(req.user.id)
      .select("name email role department");

    if (!chairman) {
      return { status: "fail", data: "Chairman account not found" };
    }

    /* =================================================
       FETCH ONLY NEVER-PROCESSED APPLICATIONS
       ⚠️ THIS IS THE MOST IMPORTANT FIX
    ================================================= */
    const applications = await AdmissionApplicationModel.find({
      department: chairman.department,
      applicationStatus: "SupervisorApproved" // 🔒 ONLY FIRST TIME
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

      /* ===== CALCULATE MERIT ===== */
      list.forEach(app => {
        app.academicQualificationPoints =
          calculateTotalMeritPoint(app);
      });

      /* ===== SORT BY MERIT THEN TIME ===== */
      list.sort((a, b) => {
        if (b.academicQualificationPoints !== a.academicQualificationPoints) {
          return b.academicQualificationPoints - a.academicQualificationPoints;
        }
        return a.createdAt - b.createdAt;
      });

      /* =================================================
         APPLY FINAL RULES
         ✔️ Only top 3 auto selected
         ✔️ Others stay waiting
      ================================================= */
      for (let i = 0; i < list.length; i++) {
        const app = list[i];
        const rank = i + 1;

        if (rank <= AUTO_QUOTA) {
          // ✅ AUTO SELECT (TOP 3)
          app.applicationStatus = "ChairmanSelected";
          app.isWithinSupervisorQuota = true;
        } else {
          // ⏳ WAITING (4+)
          app.applicationStatus = "ChairmanWaiting";
          app.isWithinSupervisorQuota = false;
        }

        app.supervisorRank = rank;

        app.approvalLog.push({
          role: "Chairman",
          approvedBy: chairman._id,
          approvedByName: chairman.name,
          approvedByEmail: chairman.email,
          approvedByRoleAtThatTime: chairman.role,
          decision: rank <= AUTO_QUOTA ? "Selected" : "Waiting",
          remarks: `Merit Rank ${rank} | Merit ${app.academicQualificationPoints}`,
          decidedAt: new Date()
        });

        await app.save();

        /* ================= EMAIL ================= */
        const subject =
          rank <= AUTO_QUOTA
            ? "PGS Application Selected (Merit Based)"
            : "PGS Application – Waiting List";

        const message =
          rank <= AUTO_QUOTA
            ? `Dear ${app.applicantName},

Congratulations! You have been SELECTED based on merit.

Supervisor : ${app.supervisor.name}
Merit Rank : ${rank}
Merit Point: ${app.academicQualificationPoints}

Regards,
PGS Admission Office`
            : `Dear ${app.applicantName},

Your application is currently on the WAITING LIST.

Merit Rank : ${rank}
Merit Point: ${app.academicQualificationPoints}

You may be considered later if quota allows.

Regards,
PGS Admission Office`;

        await SendEmailUtility(app.email, message, subject);
      }
    }

    return {
      status: "success",
      data: "Chairman merit finalized successfully"
    };

  } catch (error) {
    console.error("ChairmanDecisionService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = ChairmanDecisionService;
