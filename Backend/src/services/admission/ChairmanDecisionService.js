const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const SendEmailUtility = require("../../utility/SendEmailUtility");

const MAX_PER_SUPERVISOR = 10;

/* =========================================================
   POINT-9 SCORING (CGPA → POINT)
========================================================= */
const scoreFromCGPA = (cgpa) => {
  if (cgpa >= 3.75) return 10;
  if (cgpa >= 3.50) return 9;
  if (cgpa >= 3.25) return 8;
  if (cgpa >= 3.00) return 7;
  if (cgpa >= 2.75) return 6;
  return 5;
};

/* =========================================================
   PSTU WEIGHTED CGPA CALCULATION
========================================================= */
const calculateWeightedCGPA = (courses = []) => {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const c of courses) {
    totalPoints += Number(c.cgpa) * Number(c.creditHours);
    totalCredits += Number(c.creditHours);
  }

  if (!totalCredits) return 0;
  return Number((totalPoints / totalCredits).toFixed(2));
};

/* =========================================================
   FINAL CGPA EXTRACTOR (PROGRAM-AWARE)
========================================================= */
const getFinalCGPA = (application) => {
  const { program, academicRecords, isPSTUStudent, pstuLastSemesterCourses } =
    application;

  // ---------- PSTU STUDENT ----------
  if (isPSTUStudent) {
    return calculateWeightedCGPA(pstuLastSemesterCourses);
  }

  // ---------- NON-PSTU ----------
  if (program === "PhD") {
    const ms = academicRecords.find(
      r =>
        ["MS", "MBA"].includes(r.examLevel) &&
        r.isFinal === true &&
        r.cgpaScale === 4
    );
    return ms?.cgpa || 0;
  }

  // MS / MBA
  const bachelor = academicRecords.find(
    r =>
      ["BSc", "BBA"].includes(r.examLevel) &&
      r.isFinal === true &&
      r.cgpaScale === 4
  );

  return bachelor?.cgpa || 0;
};

/* =========================================================
   CHAIRMAN DECISION SERVICE
========================================================= */
const ChairmanDecisionService = async (req) => {
  try {
    const chairman = req.user;

    if (chairman.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    /* ================= FETCH ================= */
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
      const sid = app.supervisor._id.toString();
      if (!grouped[sid]) grouped[sid] = [];
      grouped[sid].push(app);
    }

    /* ================= PROCESS PER SUPERVISOR ================= */
    for (const supervisorId in grouped) {
      const list = grouped[supervisorId];

      // 🔢 Calculate CGPA + POINT-9
      list.forEach(app => {
        const finalCGPA = getFinalCGPA(app);
        const points = scoreFromCGPA(finalCGPA);

        app.academicQualificationPoints = points;
        app._finalCGPA = finalCGPA; // temp only
      });

      // 🔽 Sort: highest CGPA → earliest application
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
          remarks: `Rank ${i + 1} | CGPA ${app._finalCGPA}`
        });

        delete app._finalCGPA;
        await app.save();

        /* ================= EMAIL ================= */
        const subject = selected
          ? "PGS Application Selected (Academic Merit)"
          : "PGS Application – Waiting List";

        const message = selected
          ? `
Dear ${app.applicantName},

You have been SELECTED based on academic merit
(Point-9 evaluation).

Your documents will now be reviewed by the Dean.

Supervisor: ${app.supervisor.name}

Regards,
PGS Admission Office
          `
          : `
Dear ${app.applicantName},

Your application is currently on the WAITING LIST
based on academic ranking.

You will be notified if a seat becomes available.

Regards,
PGS Admission Office
          `;

        await SendEmailUtility(app.email, message, subject);
      }
    }

    return {
      status: "success",
      data: "Chairman academic selection completed successfully"
    };

  } catch (error) {
    console.error("ChairmanDecisionService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = ChairmanDecisionService;
