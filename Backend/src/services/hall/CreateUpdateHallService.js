const HallModel = require("../../models/Halls/HallModel");

const CreateUpdateHallService = async (req) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return { status: "fail", data: "Unauthorized" };
    }

    const { id, name, code, description } = req.body;

    if (!name || !code) {
      return { status: "fail", data: "Hall name and code required" };
    }

    // 🔁 UPDATE
    if (id) {
      const hall = await HallModel.findById(id);
      if (!hall) {
        return { status: "fail", data: "Hall not found" };
      }

      hall.name = name.trim();
      hall.code = code.toUpperCase().trim();
      hall.description = description || "";

      await hall.save();
      return { status: "success", data: "Hall updated successfully" };
    }

    // 🆕 CREATE
    await HallModel.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description || "",
      createdBy: req.user.id
    });

    return { status: "success", data: "Hall created successfully" };

  } catch (error) {
    console.error("CreateUpdateHallService Error:", error);
    return { status: "fail", data: error.message };
  }
};

module.exports = CreateUpdateHallService;
