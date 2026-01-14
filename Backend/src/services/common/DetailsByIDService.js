const mongoose = require("mongoose");

const DetailsByIDService = async (Request, DataModel) => {
  try {
    const id = Request.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { status: "fail", message: "Invalid ID" };
    }

    const data = await DataModel.find({ _id: id });
    return { status: "success", data };

  } catch (error) {
    return { status: "fail", message: error.message };
  }
};

module.exports = DetailsByIDService;
