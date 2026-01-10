const bcrypt = require("bcryptjs");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const DeanDecisionService = async (req) => {
  try {
    const { applicationId, decision, remarks } = req.body;
    const dean = req.user;

    if (dean.role !== "Dean") {
      return { status: "fail", data: "Unauthorized" };
    }

    const application = await AdmissionApplicationModel.findOne({
      _id: applicationId,
      applicationStatus: "ChairmanApproved"
    });

    if (!application) {
      return { status: "fail", data: "Application not found or invalid state" };
    }

    // ================= REJECT =================
    if (decision === "Reject") {
      application.applicationStatus = "DeanRejected";

      application.approvalLog.push({
        role: "Dean",
        approvedBy: dean._id,
        decision: "Rejected",
        remarks
      });

      await application.save();
      return { status: "success", data: "Application rejected" };
    }

    // ================= APPROVE =================
    if (application.applicationStatus === "DeanApproved") {
      return { status: "fail", data: "Already approved by Dean" };
    }

    // 🔢 10-digit temp login ID
    const tempId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // 🔐 temp password
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // ⏳ expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    application.applicationStatus = "DeanApproved";

    application.temporaryLogin = {
      tempId,
      password: hashedPassword,
      expiresAt,
      isUsed: false
    };

    application.approvalLog.push({
      role: "Dean",
      approvedBy: dean._id,
      decision: "Approved",
      remarks
    });

    await application.save();

    return {
      status: "success",
      data: {
        tempLoginId: tempId,
        tempPassword: rawPassword,
        expiresAt
      }
    };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

module.exports = DeanDecisionService;
