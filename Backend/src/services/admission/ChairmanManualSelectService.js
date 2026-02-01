const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const UsersModel =
  require("../../models/Users/UsersModel");
const SendEmailUtility =
  require("../../utility/SendEmailUtility");

const AUTO_QUOTA = 3;
const MAX_QUOTA = 5;

/* =========================================================
   CHAIRMAN MANUAL SELECT SERVICE (RANK 4–5) – FIXED
========================================================= */
const ChairmanManualSelectService = async (req) => {
  try {
    /* ================= AUTH ================= */
    if (!req.user || req.user.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const { applicationId } = req.body;
    if (!applicationId) {
      return { status: "fail", data: "Application ID required" };
    }

    const chairman = await UsersModel.findById(req.user.id)
      .select("name email role department");

    if (!chairman) {
      return { status: "fail", data: "Chairman account not found" };
    }

    /* ================= LOAD APPLICATION ================= */
    const app = await AdmissionApplicationModel.findById(applicationId)
      .populate("supervisor", "name email");

    if (!app) {
      return { status: "fail", data: "Application not found" };
    }

    /* ================= BASIC VALIDATIONS ================= */
    if (String(app.department) !== String(chairman.department)) {
      return { status: "fail", data: "Department mismatch" };
    }

    if (app.applicationStatus !== "ChairmanWaiting") {
      return { status: "fail", data: "Application not in waiting list" };
    }

  if (
  typeof app.supervisorRank !== "number" ||
  app.supervisorRank <= AUTO_QUOTA ||
  app.supervisorRank > MAX_QUOTA
) {
  return {
    status: "fail",
    data: "Invalid or ineligible rank"
  };
}


    /* =====================================================
       CORRECT QUOTA CHECK (RANK-BASED)
       ✔ Top 5 ranks only per supervisor
    ===================================================== */
    const alreadySelected = await AdmissionApplicationModel.countDocuments({
      supervisor: app.supervisor,
      supervisorRank: { $lte: MAX_QUOTA }
    });

    if (alreadySelected >= MAX_QUOTA) {
      return {
        status: "fail",
        data: "Supervisor quota already full"
      };
    }

    /* ================= MANUAL SELECT ================= */
    app.applicationStatus = "ChairmanSelected";
    app.isWithinSupervisorQuota = true;

    app.approvalLog.push({
      role: "Chairman",
      approvedBy: chairman._id,
      approvedByName: chairman.name,
      approvedByEmail: chairman.email,
      approvedByRoleAtThatTime: chairman.role,
      decision: "Selected",
      remarks: `Manually selected by Chairman | Rank ${app.supervisorRank}`,
      decidedAt: new Date()
    });

    await app.save();

    /* ================= EMAIL ================= */
    const subject = "PGS Application Selected (Manual Selection)";

    const message = `Dear ${app.applicantName},

Congratulations! You have been SELECTED by the Chairman.

Supervisor : ${app.supervisor.name}
Merit Rank : ${app.supervisorRank}

You will now proceed to the Dean approval stage.

Regards,
PGS Admission Office`;

    await SendEmailUtility(app.email, message, subject);

    return {
      status: "success",
      data: "Application manually selected successfully"
    };

  } catch (error) {
    console.error("ChairmanManualSelectService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = ChairmanManualSelectService;
