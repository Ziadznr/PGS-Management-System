const bcrypt = require("bcryptjs");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const TemporaryLoginService = async (req) => {
  try {
    const { tempLoginId, password } = req.body;

    // 1️⃣ Find application by temp login
    const application = await AdmissionApplicationModel.findOne({
      "temporaryLogin.tempId": tempLoginId
    });

    if (!application) {
      return { status: "fail", data: "Invalid temporary login ID" };
    }

    // 2️⃣ Check expiry
    if (!application.temporaryLogin.expiresAt ||
        application.temporaryLogin.expiresAt < new Date()) {
      return { status: "fail", data: "Temporary access expired" };
    }

    // 3️⃣ Check already used
    if (application.temporaryLogin.isUsed) {
      return { status: "fail", data: "Temporary access already used" };
    }

    // 4️⃣ Verify password
    const match = await bcrypt.compare(
      password,
      application.temporaryLogin.tempPassword
    );

    if (!match) {
      return { status: "fail", data: "Invalid credentials" };
    }

    // 5️⃣ Mark temp login as used
    application.temporaryLogin.isUsed = true;
    await application.save();

    return {
      status: "success",
      data: {
        applicationId: application._id,
        department: application.department,
        email: application.email
      }
    };

  } catch (error) {
    return { status: "fail", data: error.toString() };
  }
};

module.exports = TemporaryLoginService;
