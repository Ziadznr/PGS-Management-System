const HallModel = require("../../models/Halls/HallModel");

const DeleteHallService = async (req) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized" };
    }

    const { id } = req.params;

    const hall = await HallModel.findById(id);
    if (!hall) {
      return { status: "fail", data: "Hall not found" };
    }

    hall.isActive = false;
    await hall.save();

    return { status: "success", data: "Hall deleted successfully" };

  } catch (error) {
    console.error("DeleteHallService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = DeleteHallService;
