// 🔒 Chairman – Create Blueprint
const ChairmanDecisionBluePrintService =
  require("../../services/decisionBluePrint/ChairmanDecisionBluePrintService");
  const ListChairmanDecisionBlueprintService =
  require("../../services/decisionBluePrint/ListChairmanDecisionBlueprintService");

exports.CreateChairmanDecisionBlueprint = async (req, res) => {
  const result =
    await ChairmanDecisionBluePrintService(req);

  return res.status(
    result.status === "success" ? 200 : 400
  ).json(result);
};


exports.ListChairmanDecisionBlueprint = async (req, res) => {
  const result =
    await ListChairmanDecisionBlueprintService(req);

  return res.status(
    result.status === "success" ? 200 : 400
  ).json(result);
};
