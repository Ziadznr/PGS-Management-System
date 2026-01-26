const AdmissionSeasonModel =
  require("../../models/Admission/AdmissionSeasonModel");

/* ======================================================
   SERVICES
====================================================== */

// -------- PUBLIC --------
const ApplyForAdmissionService =
  require("../../services/admission/ApplyForAdmissionService");
const TemporaryLoginService =
  require("../../services/admission/TemporaryLoginService");
  const PublicAdmissionSeasonService =
  require("../../services/admission/PublicAdmissionSeasonService");

// -------- ADMIN --------
const CreateAdmissionSeasonService =
  require("../../services/admission/CreateAdmissionSeasonService");
const SetDepartmentRangeService =
  require("../../services/admission/SetDepartmentRegRangeService");
const FinalizeEnrollmentService =
  require("../../services/admission/FinalizeEnrollmentService");

// -------- DECISION FLOW --------
const SupervisorDecisionService =
  require("../../services/admission/SupervisorDecisionService");
const ChairmanDecisionService =
  require("../../services/admission/ChairmanDecisionService");
const DeanDecisionService =
  require("../../services/admission/DeanDecisionService");

// -------- PANELS --------
const SupervisorPanelListService =
  require("../../services/admission/SupervisorPanelListService");
const ChairmanPanelListService =
  require("../../services/admission/ChairmanPanelListService");
const DeanPanelListService =
  require("../../services/admission/DeanPanelListService");

/* ======================================================
   PUBLIC CONTROLLERS
====================================================== */

// 🔓 Student applies for admission (NO LOGIN REQUIRED)
exports.ApplyForAdmission = async (req, res) => {
  try {
    const result = await ApplyForAdmissionService(req);

    // 🔥 THIS LINE IS THE KEY
    if (result.status === "fail") {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("ApplyForAdmission Controller Error:", error);
    return res.status(500).json({
      status: "fail",
      data: "Internal server error"
    });
  }
};


// 🔓 Temporary login (after Dean approval)
exports.TemporaryLogin = async (req, res) => {
  try {
    const result = await TemporaryLoginService(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

/* ======================================================
   ADMIN CONTROLLERS
====================================================== */

// 🔒 Create admission season
exports.CreateAdmissionSeason = async (req, res) => {
  try {
    const result = await CreateAdmissionSeasonService(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

// 🔒 Admission season list
exports.AdmissionSeasonList = async (req, res) => {
  try {
    const result = await CreateAdmissionSeasonService.List(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

// 🔒 Lock / Unlock admission season
exports.ToggleSeasonLock = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.json({
        status: "fail",
        data: "Unauthorized"
      });
    }

    const { seasonId } = req.params;

    const season = await AdmissionSeasonModel.findById(seasonId);
    if (!season) {
      return res.json({
        status: "fail",
        data: "Season not found"
      });
    }

    season.isLocked = !season.isLocked;
    await season.save();

    return res.json({
      status: "success",
      data: season.isLocked
        ? "Season locked successfully"
        : "Season unlocked successfully"
    });

  } catch (error) {
    return res.json({
      status: "fail",
      data: error.message
    });
  }
};

/* ======================================================
   DEPARTMENT REGISTRATION RANGE (ADMIN)
====================================================== */

// 🔒 Create or update department registration range
exports.CreateUpdateDepartmentRange = async (req, res) => {
  try {
    const result = await SetDepartmentRangeService.CreateOrUpdate(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

// 🔒 List department ranges (season-wise)
exports.DepartmentRangeList = async (req, res) => {
  try {
    const result = await SetDepartmentRangeService.ListBySeason(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

// 🔒 Delete department range
exports.DeleteDepartmentRange = async (req, res) => {
  try {
    const result = await SetDepartmentRangeService.Delete(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

/* ======================================================
   DECISION FLOW CONTROLLERS
====================================================== */

// 🔒 Supervisor decision
exports.SupervisorDecision = async (req, res) => {
  try {
    const result = await SupervisorDecisionService(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

// 🔒 Chairman decision (academic ranking + selection)
exports.ChairmanDecision = async (req, res) => {
  try {
    const result = await ChairmanDecisionService(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

// 🔒 Dean final approval + temp credentials
exports.DeanDecision = async (req, res) => {
  try {
    const result = await DeanDecisionService(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

/* ======================================================
   ENROLLMENT
====================================================== */

// 🔓 Final enrollment (after temporary login)
exports.FinalizeEnrollment = async (req, res) => {
  try {
    const result = await FinalizeEnrollmentService(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

/* ======================================================
   PANEL LIST CONTROLLERS
====================================================== */

// 🔒 Supervisor panel
exports.SupervisorPanelList = async (req, res) => {
  try {
    const result = await SupervisorPanelListService(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

// 🔒 Chairman panel
exports.ChairmanPanelList = async (req, res) => {
  try {
    const result = await ChairmanPanelListService(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};

// 🔒 Dean panel
exports.DeanPanelList = async (req, res) => {
  try {
    const result = await DeanPanelListService(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      data: error.message
    });
  }
};



// 🔓 PUBLIC SEASON LIST
exports.PublicAdmissionSeasons = async (req, res) =>
  res.status(200).json(await PublicAdmissionSeasonService());

exports.DownloadPDF = (req, res) => {
  const filePath = path.join(
    __dirname,
    `../../storage/pdfs/${req.params.applicationNo}.pdf`
  );

  res.download(filePath);
};


const EnrollmentSummaryService =
  require("../../services/enrollment/EnrollmentSummaryService");

exports.EnrollmentSummary = async (req, res) => {
  const result = await EnrollmentSummaryService();
  return res.status(200).json(result);
};

