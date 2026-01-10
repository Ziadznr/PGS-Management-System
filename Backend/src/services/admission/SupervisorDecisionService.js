const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const SupervisorDecisionService = async (req) => {
  try {
    const { applicationId, decision, remarks } = req.body;
    const supervisorId = req.user._id;

    // 1️⃣ Validate decision
    if (!["Approve", "Reject"].includes(decision)) {
      return { status: "fail", data: "Invalid decision" };
    }

    // 2️⃣ Find application
    const application = await AdmissionApplicationModel.findOne({
      _id: applicationId,
      supervisor: supervisorId,
      applicationStatus: "Submitted"
    });

    if (!application) {
      return {
        status: "fail",
        data: "Application not found or already processed"
      };
    }

    // 3️⃣ Update status
    application.applicationStatus =
      decision === "Approve"
        ? "SupervisorApproved"
        : "SupervisorRejected";

    // 4️⃣ Log decision
    application.approvalLog.push({
      role: "Supervisor",
      approvedBy: supervisorId,
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

module.exports = SupervisorDecisionService;
