const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");
const TemporaryEnrollmentAuthModel =
  require("../../models/Admission/TemporaryEnrollmentAuthModel");
const SendEmailUtility =
  require("../../utility/SendEmailUtility");
const UsersModel =
  require("../../models/Users/UsersModel");

const DeanDecisionService = async (req) => {
  try {
    const { applicationId, decision, remarks } = req.body;
    const deanSession = req.user;

    /* ================= 1️⃣ AUTH ================= */
    if (!deanSession || deanSession.role !== "Dean") {
      return { status: "fail", data: "Unauthorized access" };
    }

    const deanId = deanSession.id;

    const dean = await UsersModel
      .findById(deanId)
      .select("name email role");

    if (!dean) {
      return { status: "fail", data: "Dean account not found" };
    }

    if (!["Approve", "Reject"].includes(decision)) {
      return { status: "fail", data: "Invalid decision" };
    }

    /* ================= 2️⃣ FETCH APPLICATION ================= */
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

    /* ================= 3️⃣ REJECT ================= */
    if (decision === "Reject") {
      application.applicationStatus = "DeanRejected";

      application.approvalLog.push({
        role: "Dean",
        approvedBy: dean._id,
        approvedByName: dean.name,
        approvedByEmail: dean.email,
        approvedByRoleAtThatTime: dean.role,
        decision: "Rejected",
        remarks: remarks || "",
        decidedAt: new Date()
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

    /* ================= 4️⃣ APPROVE ================= */

    // 🔐 Generate temp credentials
    const tempLoginId = application.mobile; // ✅ SAME as user enters
    const rawPassword = crypto.randomBytes(4).toString("hex");
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // ✅ Save application state
    application.applicationStatus = "DeanAccepted";

    application.approvalLog.push({
      role: "Dean",
      approvedBy: dean._id,
      approvedByName: dean.name,
      approvedByEmail: dean.email,
      approvedByRoleAtThatTime: dean.role,
      decision: "Approved",
      remarks: remarks || "",
      decidedAt: new Date()
    });

    await application.save();

    // ✅ CREATE TEMP LOGIN (🔥 THIS WAS MISSING)
    await TemporaryEnrollmentAuthModel.create({
      application: application._id,
      loginId: tempLoginId,
      passwordHash,
      expiresAt,
      isUsed: false
    });

    // 📧 SEND EMAIL
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
Login ID   : ${tempLoginId}
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
        tempLoginId,
        expiresAt
      }
    };

  } catch (error) {
    console.error("DeanDecisionService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = DeanDecisionService;
