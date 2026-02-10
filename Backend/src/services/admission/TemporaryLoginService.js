const bcrypt = require("bcryptjs");
const TemporaryEnrollmentAuthModel =
  require("../../models/Admission/TemporaryEnrollmentAuthModel");
const AdmissionApplicationModel =
  require("../../models/Admission/AdmissionApplicationModel");

const TemporaryLoginService = async (req) => {
  try {
    const { tempLoginId, password } = req.body;

    if (!tempLoginId || !password) {
      return { status: "fail", data: "Login ID and password required" };
    }

    /* =================================================
       1️⃣ FIND TEMP LOGIN RECORD
    ================================================= */
    const tempAuth = await TemporaryEnrollmentAuthModel
      .findOne({ loginId: tempLoginId })
      .populate("application");

    if (!tempAuth) {
      return { status: "fail", data: "Invalid temporary login" };
    }

    const {
      application,
      passwordHash,
      expiresAt
    } = tempAuth;

    /* =================================================
       2️⃣ APPLICATION STATE CHECK
    ================================================= */
    if (!application || application.applicationStatus !== "DeanAccepted") {
      return {
        status: "fail",
        data: "Application not eligible for enrollment"
      };
    }

    /* =================================================
       3️⃣ EXPIRY CHECK (ONLY HARD BLOCK)
    ================================================= */
    if (expiresAt < new Date()) {
      // ❌ Seat forfeited
      application.applicationStatus = "ChairmanWaiting";
      await application.save();

      await TemporaryEnrollmentAuthModel.deleteOne({
        _id: tempAuth._id
      });

      return {
        status: "fail",
        data: "Temporary login expired. Seat forfeited."
      };
    }

    /* =================================================
       4️⃣ PASSWORD VERIFY
    ================================================= */
    const match = await bcrypt.compare(password, passwordHash);
    if (!match) {
      return { status: "fail", data: "Invalid credentials" };
    }

    /* =================================================
       ✅ SUCCESS (MULTIPLE LOGINS ALLOWED)
    ================================================= */
   return {
  status: "success",
  data: {
    loginId: tempAuth.loginId,          // ✅ REQUIRED
    applicationId: application._id,
    applicationNo: application.applicationNo,
    applicantName: application.applicantName,
    program: application.program,
    academicYear: application.academicYear,
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
