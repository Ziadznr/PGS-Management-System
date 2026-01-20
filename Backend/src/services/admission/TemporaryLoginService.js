const bcrypt = require("bcryptjs");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const TemporaryLoginService = async (req) => {
  try {
    const { tempLoginId, password } = req.body;

    if (!tempLoginId || !password) {
      return { status: "fail", data: "Login ID and password required" };
    }

    // ================= 1️⃣ FIND APPLICATION =================
    const application = await AdmissionApplicationModel.findOne({
      "temporaryLogin.tempId": tempLoginId,
      applicationStatus: "DeanAccepted"
    });

    if (!application) {
      return { status: "fail", data: "Invalid temporary login" };
    }

    const { expiresAt, isUsed, password: hashedPassword } =
      application.temporaryLogin;

    // ================= 2️⃣ EXPIRY =================
    if (!expiresAt || expiresAt < new Date()) {
      application.applicationStatus = "ChairmanWaiting";
      application.temporaryLogin = undefined;
      await application.save();

      return {
        status: "fail",
        data: "Temporary login expired. Seat forfeited."
      };
    }

    // ================= 3️⃣ USED =================
    if (isUsed) {
      return { status: "fail", data: "Temporary login already used" };
    }

    // ================= 4️⃣ VERIFY =================
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      return { status: "fail", data: "Invalid credentials" };
    }

    // ================= 5️⃣ MARK USED =================
    application.temporaryLogin.isUsed = true;
    await application.save();

    return {
      status: "success",
      data: {
        applicationId: application._id,
        applicantName: application.applicantName,
        program: application.program,
        department: application.department,
        supervisor: application.supervisor,
        email: application.email,
        enrollmentDeadline: expiresAt
      }
    };

  } catch (error) {
    console.error("TemporaryLoginService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = TemporaryLoginService;
