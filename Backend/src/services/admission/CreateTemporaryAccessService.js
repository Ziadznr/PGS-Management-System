const bcrypt = require("bcryptjs");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const CreateTemporaryAccessService = async (applicationId) => {
  try {
    const application =
      await AdmissionApplicationModel.findById(applicationId);

    if (!application) {
      return { status: "fail", data: "Application not found" };
    }

    // 🔢 10-digit temporary login ID
    const tempLoginId = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();

    // 🔐 Temporary password
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // ⏳ Valid for 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // ✅ Store INSIDE application
    application.temporaryLogin = {
      tempId: tempLoginId,
      expiresAt,
      isUsed: false
    };

    // Optional: mark status clearly
    application.applicationStatus = "DeanApproved";

    await application.save();

    return {
      status: "success",
      data: {
        tempLoginId,
        tempPassword: rawPassword,
        expiresAt
      }
    };

  } catch (error) {
    return { status: "fail", data: error.toString() };
  }
};

module.exports = CreateTemporaryAccessService;
