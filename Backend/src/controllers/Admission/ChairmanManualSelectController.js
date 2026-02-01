const ChairmanManualSelectService =
  require("../../services/admission/ChairmanManualSelectService");

exports.ChairmanManualSelect = async (req, res) => {
  const result = await ChairmanManualSelectService(req);
  return res.status(200).json(result);
};


