const HallModel = require("../../models/Halls/HallModel");

const HallDropdownService = async () => {
  try {
    const halls = await HallModel
      .find({ isActive: true })
      .select("_id name code")
      .sort({ name: 1 })
      .lean();

    return halls;

  } catch (error) {
    console.error("HallDropdownService Error:", error);
    return [];
  }
};

module.exports = HallDropdownService;
