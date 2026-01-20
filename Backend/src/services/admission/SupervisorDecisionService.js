const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const SendEmailUtility = require("../../utility/SendEmailUtility");

const SupervisorDecisionService = async (req) => {
  try {
    const { applicationId, decision, remarks } = req.body;
    const supervisorId = req.user.id;

    // ================= 1️⃣ VALIDATE DECISION =================
    if (!["Approve", "Reject"].includes(decision)) {
      return { status: "fail", data: "Invalid decision" };
    }

    // ================= 2️⃣ FIND APPLICATION =================
    const application = await AdmissionApplicationModel.findOne({
      _id: applicationId,
      supervisor: supervisorId,
      applicationStatus: "Submitted"
    }).populate([
      { path: "department", select: "name" },
      { path: "supervisor", select: "name email" }
    ]);

    if (!application) {
      return {
        status: "fail",
        data: "Application not found or already processed"
      };
    }

    // ================= 3️⃣ UPDATE STATUS =================
    const finalStatus =
      decision === "Approve"
        ? "SupervisorApproved"
        : "SupervisorRejected";

    application.applicationStatus = finalStatus;

    // ================= 4️⃣ LOG DECISION =================
    application.approvalLog.push({
      role: "Supervisor",
      approvedBy: supervisorId,
      decision: decision === "Approve" ? "Approved" : "Rejected",
      remarks
    });

    await application.save();

    // ================= 5️⃣ EMAIL APPLICANT =================
    const emailSubject =
      decision === "Approve"
        ? "PGS Application Approved by Supervisor"
        : "PGS Application Rejected by Supervisor";

    const emailBody =
      decision === "Approve"
        ? `
Dear ${application.applicantName},

Your application (Application No: ${application.applicationNo})
has been approved by your selected supervisor.

It will now be reviewed by the Department Chairman.

Regards,
PGS Admission Office
        `
        : `
Dear ${application.applicantName},

We regret to inform you that your application
(Application No: ${application.applicationNo})
has been rejected by the supervisor.

Remarks:
${remarks || "Not specified"}

Regards,
PGS Admission Office
        `;

    await SendEmailUtility(
      application.email,
      emailBody,
      emailSubject
    );

    // ================= 6️⃣ RESPONSE =================
    return {
      status: "success",
      data: {
        applicationId: application._id,
        applicationStatus: application.applicationStatus
      }
    };

  } catch (error) {
    console.error("SupervisorDecisionService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = SupervisorDecisionService;
