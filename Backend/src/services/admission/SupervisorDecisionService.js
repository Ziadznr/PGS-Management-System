const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const SendEmailUtility =
  require("../../utility/SendEmailUtility");
const UsersModel =
  require("../../models/Users/UsersModel");

const SupervisorDecisionService = async (req) => {
  try {
    /* ================= AUTH ================= */
    const supervisorSession = req.user;

    if (!supervisorSession || supervisorSession.role !== "Supervisor") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const supervisorId = supervisorSession?.id?.toString();

    if (!supervisorId) {
      return {
        status: "fail",
        data: "Supervisor ID missing from session"
      };
    }

    /* ================= LOAD SUPERVISOR SNAPSHOT ================= */
    const supervisor = await UsersModel
      .findById(supervisorId)
      .select("name email role");

    if (!supervisor) {
      return {
        status: "fail",
        data: "Supervisor account not found"
      };
    }

    const { applicationId, decision, remarks } = req.body;

    /* ================= VALIDATE DECISION ================= */
    if (!["Approve", "Reject"].includes(decision)) {
      return { status: "fail", data: "Invalid decision" };
    }

    /* ================= FIND APPLICATION ================= */
    const application = await AdmissionApplicationModel
      .findById(applicationId)
      .populate("supervisor", "name email");

    if (!application) {
      return { status: "fail", data: "Application not found" };
    }

    if (application.applicationStatus !== "Submitted") {
      return {
        status: "fail",
        data: "Application already processed"
      };
    }

    /* ================= VERIFY SUPERVISOR ================= */
    const appSupervisorId =
      application.supervisor?._id
        ? application.supervisor._id.toString()
        : application.supervisor?.toString();

    if (!appSupervisorId) {
      return {
        status: "fail",
        data: "Application supervisor missing"
      };
    }

    if (appSupervisorId !== supervisorId) {
      return {
        status: "fail",
        data: "You are not assigned as supervisor for this application"
      };
    }

    /* ================= UPDATE STATUS ================= */
    application.applicationStatus =
      decision === "Approve"
        ? "SupervisorApproved"
        : "SupervisorRejected";

    /* ================= APPROVAL LOG (IMMUTABLE SNAPSHOT) ================= */
    application.approvalLog.push({
      role: "Supervisor",

      approvedBy: supervisor._id,
      approvedByName: supervisor.name,
      approvedByEmail: supervisor.email,
      approvedByRoleAtThatTime: supervisor.role,

      decision: decision === "Approve" ? "Approved" : "Rejected",
      remarks: remarks || "",
      decidedAt: new Date()
    });

    await application.save();

    /* ================= EMAIL ================= */
    const emailSubject =
      decision === "Approve"
        ? "PGS Application Approved by Supervisor"
        : "PGS Application Rejected by Supervisor";

    const emailBody =
      decision === "Approve"
        ? `
Dear ${application.applicantName},

Your application (Application No: ${application.applicationNo})
has been approved by your supervisor.

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

    /* ================= RESPONSE ================= */
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
