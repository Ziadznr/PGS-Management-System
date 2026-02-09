const CreateService = require("../../services/common/CreateService");
const UpdateService = require("../../services/common/UpdateService");
const DeleteHallService =
  require("../../services/hall/DeleteHallService");
const HallListService =
  require("../../services/hall/HallListService");
  const DetailsByIDService =
  require("../../services/common/DetailsByIDService");
const HallDropdownService =
  require("../../services/hall/HallDropdownService");
const HallModel = require("../../models/Halls/HallModel");

/* =========================
   CREATE HALL
========================= */
exports.CreateHall = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({
      status: "fail",
      message: "Hall name is required"
    });
  }

  const result = await CreateService(req, HallModel);
  res.status(200).json(result);
};

/* =========================
   UPDATE HALL
========================= */
exports.UpdateHall = async (req, res) => {
  const result = await UpdateService(req, HallModel);
  res.status(200).json(result);
};

exports.Delete = async (req, res) => {
  const result = await DeleteHallService(req);
  return res.status(200).json(result);
};

exports.List = async (req, res) => {
  const result = await HallListService();
  return res.status(200).json(result);
};

exports.HallDetailsByID = async (req, res) => {
  const result = await DetailsByIDService(req, HallModel);
  res.status(200).json(result);
};

exports.Dropdown = async (req, res) => {
  const result = await HallDropdownService();
  return res.status(200).json(result);
};
