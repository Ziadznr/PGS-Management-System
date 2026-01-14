const AdmissionSeasonModel =
  require('../../models/Admission/AdmissionSeasonModel');
// ================= SERVICES =================
const ApplyForAdmissionService = require('../../services/admission/ApplyForAdmissionService');
const CreateAdmissionSeasonService = require('../../services/admission/CreateAdmissionSeasonService');

const SetDepartmentRangeService =
  require('../../services/admission/SetDepartmentRegRangeService');

const SupervisorDecisionService = require('../../services/admission/SupervisorDecisionService');
const ChairmanDecisionService = require('../../services/admission/ChairmanDecisionService');
const DeanDecisionService = require('../../services/admission/DeanDecisionService');
const TemporaryLoginService = require('../../services/admission/TemporaryLoginService');
const FinalizeEnrollmentService = require('../../services/admission/FinalizeEnrollmentService');

const SupervisorPanelListService =
  require('../../services/admission/SupervisorPanelListService');
const ChairmanPanelListService =
  require('../../services/admission/ChairmanPanelListService');
const DeanPanelListService =
  require('../../services/admission/DeanPanelListService');

// ================= CONTROLLER =================

// -------- Student applies for admission (PUBLIC) --------
exports.ApplyForAdmission = async (req, res) =>
  res.status(200).json(await ApplyForAdmissionService(req));

// -------- Admin creates admission season --------
exports.CreateAdmissionSeason = async (req, res) =>
  res.status(200).json(await CreateAdmissionSeasonService(req));

// =================================================
// ======= DEPARTMENT REGISTRATION RANGE (ADMIN) ====
// =================================================

// CREATE or UPDATE
exports.CreateUpdateDepartmentRange = async (req, res) =>
  res.status(200).json(await SetDepartmentRangeService.CreateOrUpdate(req));

// LIST (season-wise)
exports.DepartmentRangeList = async (req, res) =>
  res.status(200).json(await SetDepartmentRangeService.ListBySeason(req));

exports.ToggleSeasonLock = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.json({ status: "fail", data: "Unauthorized" });
    }

    const { seasonId } = req.params;

    const season = await AdmissionSeasonModel.findById(seasonId);
    if (!season) {
      return res.json({ status: "fail", data: "Season not found" });
    }

    season.isLocked = !season.isLocked;
    await season.save();

    return res.json({
      status: "success",
      data: season.isLocked
        ? "Season locked successfully"
        : "Season unlocked successfully"
    });

  } catch (e) {
    return res.json({ status: "fail", data: e.message });
  }
};


// DELETE
exports.DeleteDepartmentRange = async (req, res) =>
  res.status(200).json(await SetDepartmentRangeService.Delete(req));

exports.AdmissionSeasonList = async (req, res) =>
  res.status(200).json(await CreateAdmissionSeasonService.List(req));


// =================================================
// ================= DECISION FLOW =================
// =================================================

// -------- Supervisor approves / rejects --------
exports.SupervisorDecision = async (req, res) =>
  res.status(200).json(await SupervisorDecisionService(req));

// -------- Chairman approves / rejects --------
exports.ChairmanDecision = async (req, res) =>
  res.status(200).json(await ChairmanDecisionService(req));

// -------- Dean final approval --------
exports.DeanDecision = async (req, res) =>
  res.status(200).json(await DeanDecisionService(req));

// -------- Temporary login (selected student) --------
exports.TemporaryLogin = async (req, res) =>
  res.status(200).json(await TemporaryLoginService(req));

// -------- Final enrollment --------
exports.FinalizeEnrollment = async (req, res) =>
  res.status(200).json(await FinalizeEnrollmentService(req));

// =================================================
// ================= PANEL LISTS ===================
// =================================================

// -------- Supervisor panel --------
exports.SupervisorPanelList = async (req, res) =>
  res.status(200).json(await SupervisorPanelListService(req));

// -------- Chairman panel --------
exports.ChairmanPanelList = async (req, res) =>
  res.status(200).json(await ChairmanPanelListService(req));

// -------- Dean panel --------
exports.DeanPanelList = async (req, res) =>
  res.status(200).json(await DeanPanelListService(req));
