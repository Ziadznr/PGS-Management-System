const CreateUpdateHallService =
  require("../../services/hall/CreateUpdateHallService");
const DeleteHallService =
  require("../../services/hall/DeleteHallService");
const HallListService =
  require("../../services/hall/HallListService");
const HallDropdownService =
  require("../../services/hall/HallDropdownService");

exports.CreateUpdate = async (req, res) => {
  const result = await CreateUpdateHallService(req);
  return res.status(200).json(result);
};

exports.Delete = async (req, res) => {
  const result = await DeleteHallService(req);
  return res.status(200).json(result);
};

exports.List = async (req, res) => {
  const result = await HallListService();
  return res.status(200).json(result);
};

exports.Dropdown = async (req, res) => {
  const result = await HallDropdownService();
  return res.status(200).json(result);
};
