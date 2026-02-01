const ChairmanDecisionBlueprintModel =
  require("../../models/DecisionBlueprint/ChairmanDecisionBlueprintModel");

const ListChairmanDecisionBlueprintService = async (req) => {
  try {
    if (!req.user || req.user.role !== "Chairman") {
      return { status: "fail", data: "Unauthorized" };
    }

    const blueprints =
      await ChairmanDecisionBlueprintModel.find({
        chairman: req.user.id
      })
        .populate("supervisor", "name email")
        .sort({ createdAt: -1 });

    return {
      status: "success",
      data: blueprints
    };

  } catch (error) {
    return { status: "fail", data: error.message };
  }
};

module.exports = ListChairmanDecisionBlueprintService;
