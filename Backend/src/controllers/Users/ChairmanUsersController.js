const ChairmanSupervisorsListService =
  require("../../services/chairman/ChairmanSupervisorsListService");

exports.ChairmanSupervisorsList = async (req, res) => {
  const result = await ChairmanSupervisorsListService(req);
  return res.status(200).json(result);
};
