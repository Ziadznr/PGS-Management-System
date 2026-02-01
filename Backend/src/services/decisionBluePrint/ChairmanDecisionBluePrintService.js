const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const ChairmanDecisionBlueprintModel =
  require("../../models/DecisionBlueprint/ChairmanDecisionBlueprintModel");
const UsersModel =
  require("../../models/Users/UsersModel");

const AUTO_QUOTA = 3;

/* =========================================================
   CREATE CHAIRMAN DECISION BLUEPRINT
   (Snapshot after merit finalization)
========================================================= */
const CreateChairmanDecisionBlueprintService = async (req) => {
  try {
    /* ================= AUTH ================= */
    if (!req.user || req.user.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const chairman = await UsersModel.findById(req.user.id)
      .select("name department");

    if (!chairman) {
      return { status: "fail", data: "Chairman not found" };
    }

    const { supervisorId } = req.body;

    if (!supervisorId) {
      return { status: "fail", data: "Supervisor is required" };
    }

    /* ================= PREVENT DUPLICATE ================= */
    const exists = await ChairmanDecisionBlueprintModel.findOne({
      chairman: chairman._id,
      department: chairman.department,
      supervisor: supervisorId
    });

    if (exists) {
      return {
        status: "fail",
        data: "Blueprint already created for this supervisor"
      };
    }

    /* ================= FETCH FINALIZED LIST ================= */
    const applications = await AdmissionApplicationModel.find({
      department: chairman.department,
      supervisor: supervisorId,
      applicationStatus: { $in: ["ChairmanSelected", "ChairmanWaiting"] }
    }).sort({ supervisorRank: 1 });

    if (!applications.length) {
      return {
        status: "fail",
        data: "No finalized chairman decisions found"
      };
    }

    /* ================= CREATE SNAPSHOT ================= */
    await ChairmanDecisionBlueprintModel.create({
      chairman: chairman._id,
      department: chairman.department,
      supervisor: supervisorId,

      applications: applications.map((app) => ({
        applicationId: app._id,
        applicantName: app.applicantName,
        program: app.program,
        meritPoint: app.academicQualificationPoints,
        rank: app.supervisorRank,
        status:
          app.applicationStatus === "ChairmanSelected"
            ? "Selected"
            : "Waiting"
      }))
    });

    return {
      status: "success",
      data: "Chairman decision blueprint created successfully"
    };

  } catch (error) {
    console.error("ChairmanDecisionBlueprintService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = CreateChairmanDecisionBlueprintService;
