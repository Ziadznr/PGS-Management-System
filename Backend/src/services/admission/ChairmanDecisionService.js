const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const ChairmanDecisionService = async (req) => {
  try {
    const { applicationId, decision, remarks } = req.body;
    const chairman = req.user;

    // Validate decision
    if (!["Approve", "Reject"].includes(decision)) {
      return { status: "fail", data: "Invalid decision" };
    }

    const application = await AdmissionApplicationModel.findOne({
      _id: applicationId,
      department: chairman.department,
      applicationStatus: "SupervisorApproved"
    });

    if (!application) {
      return {
        status: "fail",
        data: "Application not found or already processed"
      };
    }

    application.applicationStatus =
      decision === "Approve"
        ? "ChairmanApproved"
        : "ChairmanRejected";

    application.approvalLog.push({
      role: "Chairman",
      approvedBy: chairman._id,
      decision: decision === "Approve" ? "Approved" : "Rejected",
      remarks
    });

    await application.save();

    return {
      status: "success",
      data: {
        applicationId: application._id,
        status: application.applicationStatus
      }
    };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

module.exports = ChairmanDecisionService;
