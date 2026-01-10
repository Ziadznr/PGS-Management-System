// ================= SERVICES =================
const ApplyForAdmissionService = require('../../services/admission/ApplyForAdmissionService');
const CreateAdmissionSeasonService = require('../../services/admission/CreateAdmissionSeasonService');
const SetDepartmentRegRangeService = require('../../services/admission/SetDepartmentRegRangeService');
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
exports.ApplyForAdmission = async (req, res) => {
    try {
        const result = await ApplyForAdmissionService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", data: error.toString() });
    }
};

// -------- Admin creates admission season --------
exports.CreateAdmissionSeason = async (req, res) => {
    try {
        const result = await CreateAdmissionSeasonService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", data: error.toString() });
    }
};

// -------- Admin sets faculty registration range --------
exports.SetDepartmentRegRange = async (req, res) => {
    try {
        const result = await SetDepartmentRegRangeService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", data: error.toString() });
    }
};

// -------- Supervisor approves / rejects --------
exports.SupervisorDecision = async (req, res) => {
    try {
        const result = await SupervisorDecisionService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", data: error.toString() });
    }
};

// -------- Chairman approves / rejects --------
exports.ChairmanDecision = async (req, res) => {
    try {
        const result = await ChairmanDecisionService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", data: error.toString() });
    }
};

// -------- Dean final approval --------
exports.DeanDecision = async (req, res) => {
    try {
        const result = await DeanDecisionService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", data: error.toString() });
    }
};

// -------- Temporary login (selected student) --------
exports.TemporaryLogin = async (req, res) => {
    try {
        const result = await TemporaryLoginService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", data: error.toString() });
    }
};


// -------- Final enrollment (create user + reg no) --------
exports.FinalizeEnrollment = async (req, res) => {
    try {
        const result = await FinalizeEnrollmentService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ status: "fail", data: error.toString() });
    }
};

// -------- Supervisor panel application list --------
exports.SupervisorPanelList = async (req, res) => {
    try {
        const result = await SupervisorPanelListService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            data: error.toString()
        });
    }
};

// -------- Chairman panel application list --------
exports.ChairmanPanelList = async (req, res) => {
    try {
        const result = await ChairmanPanelListService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            data: error.toString()
        });
    }
};

// -------- Dean panel application list --------
exports.DeanPanelList = async (req, res) => {
    try {
        const result = await DeanPanelListService(req);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            data: error.toString()
        });
    }
};

