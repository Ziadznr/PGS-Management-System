const CreateOrUpdateEnrollmentService =
  require("../../services/enrollment/CreateOrUpdateEnrollmentService");

const EnrollmentDetailsService =
  require("../../services/enrollment/EnrollmentDetailsService");

/* ======================================================
   GET ENROLLMENT DETAILS (FOR FORM PREFILL)
====================================================== */
exports.EnrollmentDetails = async (req, res) => {
  try {
    // 🔐 secured by TempEnrollmentAuth middleware
    const result = await EnrollmentDetailsService(req);

    if (result.status === "fail") {
      return res.status(400).json(result);
    }

    res.status(200).json(result);

  } catch (error) {
    console.error("EnrollmentDetails Controller Error:", error);
    res.status(500).json({
      status: "fail",
      data: "Internal server error"
    });
  }
};

/* ======================================================
   CREATE / UPDATE ENROLLMENT (DRAFT ONLY)
====================================================== */
exports.CreateOrUpdateEnrollment = async (req, res) => {
  try {
    // 🔐 Inject secured applicationId from temp session
    req.body.applicationId = req.tempEnrollment.applicationId;

    const result = await CreateOrUpdateEnrollmentService(req);

    if (result.status === "fail") {
      return res.status(400).json(result);
    }

    res.status(200).json(result);

  } catch (error) {
    console.error("Enrollment Controller Error:", error);
    res.status(500).json({
      status: "fail",
      data: "Internal server error"
    });
  }
};
