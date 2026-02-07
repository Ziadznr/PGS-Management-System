const HallModel = require("../../models/Halls/HallModel");

const HallListService = async () => {
  try {
    const halls = await HallModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return { status: "success", data: halls };

  } catch (error) {
    console.error("HallListService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = HallListService;
