const TemporaryEnrollmentAuthModel =
  require("../models/Admission/TemporaryEnrollmentAuthModel");

module.exports = async (req, res, next) => {
  try {
    const loginId = req.headers["x-temp-login-id"];

    if (!loginId) {
      return res.status(401).json({
        status: "fail",
        data: "Temporary login required"
      });
    }

    const tempAuth = await TemporaryEnrollmentAuthModel
      .findOne({ loginId })
      .populate("application");

    if (!tempAuth) {
      return res.status(401).json({
        status: "fail",
        data: "Invalid temporary session"
      });
    }

    /* 🔒 EXPIRY CHECK */
    if (tempAuth.expiresAt < new Date()) {
      return res.status(401).json({
        status: "fail",
        data: "Temporary session expired"
      });
    }

    /* 🔒 APPLICATION STATE */
    if (
      !tempAuth.application ||
      tempAuth.application.applicationStatus !== "DeanAccepted"
    ) {
      return res.status(403).json({
        status: "fail",
        data: "Application not eligible for enrollment"
      });
    }

    /* ✅ ATTACH CONTEXT */
    req.tempEnrollment = {
      applicationId: tempAuth.application._id,
      applicationNo: tempAuth.application.applicationNo,
      expiresAt: tempAuth.expiresAt
    };

    next();

  } catch (error) {
    console.error("TemporaryEnrollmentAuthMiddleware Error:", error);
    res.status(500).json({
      status: "fail",
      data: "Enrollment authorization failed"
    });
  }
};
