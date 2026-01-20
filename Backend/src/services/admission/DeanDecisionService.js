const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const SendEmailUtility = require("../../utility/SendEmailUtility");

const DeanDecisionService = async (req) => {
  try {
    const { applicationId, decision, remarks } = req.body;
    const dean = req.user;

    // ================= 1️⃣ AUTH =================
    if (!dean || dean.role !== "Dean") {
      return { status: "fail", data: "Unauthorized access" };
    }

    if (!["Approve", "Reject"].includes(decision)) {
      return { status: "fail", data: "Invalid decision" };
    }

    // ================= 2️⃣ FETCH APPLICATION =================
    const application = await AdmissionApplicationModel.findOne({
      _id: applicationId,
      applicationStatus: "ChairmanSelected"
    }).populate([
      { path: "supervisor", select: "name email" },
      { path: "department", select: "name" }
    ]);

    if (!application) {
      return {
        status: "fail",
        data: "Application not eligible for Dean review"
      };
    }

    // ================= 3️⃣ REJECT =================
    if (decision === "Reject") {
      application.applicationStatus = "DeanRejected";
      application.finalDecisionAt = new Date();

      application.approvalLog.push({
        role: "Dean",
        approvedBy: dean.id,
        decision: "Rejected",
        remarks
      });

      await application.save();

      await SendEmailUtility(
        application.email,
        `
Dear ${application.applicantName},

We regret to inform you that your application
for ${application.program} has been rejected
after final review by the Dean.

Regards,
PGS Admission Office
        `,
        "PGS Admission – Final Result"
      );

      return { status: "success", data: "Application rejected" };
    }

    // ================= 4️⃣ APPROVE =================
    const tempId = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();

    const rawPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    application.applicationStatus = "DeanAccepted";
    application.finalDecisionAt = new Date();

    application.temporaryLogin = {
      tempId,
      password: hashedPassword,
      expiresAt,
      isUsed: false
    };

    application.approvalLog.push({
      role: "Dean",
      approvedBy: dean.id,
      decision: "Approved",
      remarks
    });

    await application.save();

    await SendEmailUtility(
      application.email,
      `
Dear ${application.applicantName},

Congratulations!

Your application for ${application.program}
has been FINALLY APPROVED.

━━━━━━━━━━━━━━━━━━━━━━
TEMPORARY LOGIN DETAILS
━━━━━━━━━━━━━━━━━━━━━━
Login ID   : ${tempId}
Password   : ${rawPassword}
Valid Till : ${expiresAt.toDateString()}

⚠️ You must complete enrollment within 7 days.
Otherwise your seat will be given to a waiting candidate.

Regards,
PGS Admission Office
      `,
      "PGS Admission – Enrollment Credentials"
    );

    return {
      status: "success",
      data: {
        applicationId: application._id,
        tempLoginId: tempId,
        expiresAt
      }
    };

  } catch (error) {
    console.error("DeanDecisionService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = DeanDecisionService;
