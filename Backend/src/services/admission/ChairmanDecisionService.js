const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const SendEmailUtility = require("../../utility/SendEmailUtility");

const MAX_PER_SUPERVISOR = 10;

/* =========================================================
   NORMALIZE CGPA TO SCALE-4
========================================================= */
const normalizeCGPA = (cgpa, scale) => {
  if (!cgpa || !scale) return 0;
  return scale === 5 ? (cgpa / 5) * 4 : cgpa;
};

/* =========================================================
   POINT-9 SCORING (CGPA → POINT)
========================================================= */
const scoreFromCGPA = (cgpa4) => {
  if (cgpa4 >= 3.75) return 10;
  if (cgpa4 >= 3.50) return 9;
  if (cgpa4 >= 3.25) return 8;
  if (cgpa4 >= 3.00) return 7;
  if (cgpa4 >= 2.75) return 6;
  return 5;
};

/* =========================================================
   TOTAL MERIT POINT CALCULATOR (YOUR RULE)
========================================================= */
const calculateTotalMeritPoint = (application) => {
  let total = 0;

  const { academicRecords, program, calculatedCGPA } = application;

  // SSC
  const ssc = academicRecords.find(r => r.examLevel === "SSC");
  if (ssc) {
    total += scoreFromCGPA(
      normalizeCGPA(ssc.cgpa, ssc.cgpaScale)
    );
  }

  // HSC
  const hsc = academicRecords.find(r => r.examLevel === "HSC");
  if (hsc) {
    total += scoreFromCGPA(
      normalizeCGPA(hsc.cgpa, hsc.cgpaScale)
    );
  }

  // Bachelor
  const bachelor = academicRecords.find(r =>
    ["BSc", "BBA", "LLB"].includes(r.examLevel)
  );
  if (bachelor) {
    total += scoreFromCGPA(
      normalizeCGPA(bachelor.cgpa, bachelor.cgpaScale)
    );
  }

  // MS / MBA / LLM applicants → calculatedCGPA
  if (["MS", "MBA", "LLM"].includes(program) && calculatedCGPA) {
    total += scoreFromCGPA(calculatedCGPA); // already scale-4
  }

  // PhD applicants → MS/MBA/LLM final CGPA
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
   CHAIRMAN DECISION SERVICE
========================================================= */
const ChairmanDecisionService = async (req) => {
  try {
    const chairman = req.user;

    if (!chairman || chairman.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
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

      // 🔢 Calculate total merit point
      list.forEach(app => {
        app.academicQualificationPoints =
          calculateTotalMeritPoint(app);
      });

      // 🔽 Sort: highest point → earliest submit
      list.sort((a, b) => {
        if (b.academicQualificationPoints !== a.academicQualificationPoints) {
          return b.academicQualificationPoints - a.academicQualificationPoints;
        }
        return a.createdAt - b.createdAt;
      });

      /* ================= SELECT / WAIT ================= */
      for (let i = 0; i < list.length; i++) {
        const app = list[i];
        const selected = i < MAX_PER_SUPERVISOR;

        app.applicationStatus = selected
          ? "ChairmanSelected"
          : "ChairmanWaiting";

        app.supervisorRank = i + 1;
        app.isWithinSupervisorQuota = selected;

        app.approvalLog.push({
          role: "Chairman",
          approvedBy: chairman.id,
          decision: selected ? "Selected" : "Waiting",
          remarks: `Rank ${i + 1} | Total Point ${app.academicQualificationPoints}`
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
Total Point: ${app.academicQualificationPoints}

Your application will now be reviewed by the Dean.

Regards,
PGS Admission Office
          `
          : `
Dear ${app.applicantName},

Your application is currently on the WAITING LIST
based on academic merit.

Merit Rank : ${i + 1}
Total Point: ${app.academicQualificationPoints}

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
